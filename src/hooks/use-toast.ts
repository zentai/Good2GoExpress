
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 3 // Increased limit to allow multiple item add notifications
const TOAST_REMOVE_DELAY = 1000000 // Default long delay, dismissal handled by duration or manually

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number // Added duration prop
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string, duration?: number) => {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId)) // Clear existing timeout if any
  }

  const removeDelay = duration ?? TOAST_REMOVE_DELAY;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST", // Changed to REMOVE_TOAST to actually remove it from DOM after timeout
      toastId: toastId,
    })
  }, removeDelay)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // If toast has a duration, set it up for removal
      if (action.toast.duration) {
        addToRemoveQueue(action.toast.id, action.toast.duration);
      }
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Side effect: Set up for removal if not already handled by duration
      // This allows manual dismiss to also trigger removal
      if (toastId) {
        const toastToDismiss = state.toasts.find(t => t.id === toastId);
        if (toastToDismiss && !toastToDismiss.duration) { // Only if no auto-duration
           addToRemoveQueue(toastId); // Use default long delay or a shorter one if needed
        }
      } else {
        state.toasts.forEach((toast) => {
          if (!toast.duration) {
            addToRemoveQueue(toast.id);
          }
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Trigger close animation
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type ToastOptions = Omit<ToasterToast, "id">;

function toast(props: ToastOptions) {
  const id = genId();

  const update = (updateProps: Partial<ToasterToast>) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...updateProps, id },
    });

  const dismiss = () => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });
  }
  
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          // When the toast's open state changes to false (e.g. via swipe or close button)
          // We ensure it's queued for removal from the DOM.
          // If it had a duration, it's already in queue. If not, add it now.
          const currentToast = memoryState.toasts.find(t => t.id === id);
          if (currentToast && !currentToast.duration) {
            addToRemoveQueue(id, 500); // Short delay for animation before removing
          }
        }
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}


function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
