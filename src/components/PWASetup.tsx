'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const PWASetup = () => {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
          toast({
            title: "Offline Mode Error",
            description: "Could not enable offline capabilities.",
            variant: "destructive",
          });
        });
    }
  }, [toast]);

  return null; // This component doesn't render anything
};

export default PWASetup;
