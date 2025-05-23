
'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderItem } from '@/lib/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Package, Home as HomeIcon, ShoppingBag, CheckCircle, MessageSquare, PlusCircle, MinusCircle, ArrowLeftCircle, Rocket, CalendarDays, Clock, ShoppingCart, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isSameDay, addHours, setHours, setMinutes, setSeconds, setMilliseconds, isBefore, parseISO } from 'date-fns';

const WHATSAPP_PHONE_NUMBER = '+60187693136'; // Replace with your actual number
const LOCALSTORAGE_UNIT_NUMBER_KEY = 'good2go_unitNumber';
const LOCALSTORAGE_SKIP_PREVIEW_KEY = 'good2go_skipPreview';
const PICKUP_LEAD_TIME_HOURS = 4;

interface TrayItemDisplayProps {
  item: OrderItem;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
}

function TrayItemDisplay({ item, onUpdateQuantity }: TrayItemDisplayProps) {
  const handleIncrease = () => {
    onUpdateQuantity(item.productId, item.quantity + 1);
  };

  const handleDecrease = () => {
    onUpdateQuantity(item.productId, item.quantity - 1);
  };

  let emoji = '🛍️'; // Default
  if (item.name.toLowerCase().includes('burger')) emoji = '🍔';
  else if (item.name.toLowerCase().includes('wrap')) emoji = '🌯';
  else if (item.name.toLowerCase().includes('smoothie') || item.name.toLowerCase().includes('brew') || item.name.toLowerCase().includes('drink')) emoji = '🥤';
  else if (item.name.toLowerCase().includes('bowl') || item.name.toLowerCase().includes('salad')) emoji = '🥗';


  return (
    <div className="py-4 border-b border-border last:border-b-0">
      <div className="flex justify-between items-center mb-1">
        <p className="font-medium text-foreground text-lg flex-grow">
          {emoji} {item.name}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleDecrease} className="h-11 w-11 rounded-full hover:bg-secondary active:bg-secondary/80">
            <MinusCircle className="h-6 w-6 text-primary" />
          </Button>
          <span className="font-semibold text-xl w-10 text-center tabular-nums">{item.quantity}</span>
          <Button variant="outline" size="icon" onClick={handleIncrease} className="h-11 w-11 rounded-full hover:bg-secondary active:bg-secondary/80">
            <PlusCircle className="h-6 w-6 text-primary" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground pl-8"> {/* Indent to align with name roughly */}
        RM {item.price.toFixed(2)} &times; {item.quantity} = <span className="font-medium text-foreground">RM {(item.quantity * item.price).toFixed(2)}</span>
      </p>
    </div>
  );
}

// Simulated Firebase submission function
async function submitOrderToFirebase(orderData: {
  items: OrderItem[];
  totalAmount: number;
  pickupDate: string;
  pickupTimeSlot: string;
  unitNumber?: string;
  timestamp: string;
}) {
  console.log("Simulating order submission to Firebase for packing:", orderData);
  // In a real app, you'd use Firebase SDK here to write to Firestore or Realtime Database
  // For example: await addDoc(collection(db, "packingLists"), orderData);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  return { success: true, orderId: `mock_pack_list_${Date.now()}` };
}

interface PackingPageContentProps {
  onStateChangeForParent: (data: {
    items: OrderItem[],
    pickupDate: Date | null,
    pickupTime: string,
    amount: number,
    count: number,
    unit: string,
    sendWhatsApp: boolean
  }) => void;
  initialTrayItems: OrderItem[];
  initialUnitNumber: string;
  initialSendViaWhatsApp: boolean;
  initialSelectedDate: Date | null;
  initialSelectedPickupTime: string;
}

function PackingPageContent({
  onStateChangeForParent,
  initialTrayItems,
  initialUnitNumber,
  initialSendViaWhatsApp,
  initialSelectedDate,
  initialSelectedPickupTime,
}: PackingPageContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [trayItems, setTrayItems] = useState<OrderItem[]>(initialTrayItems);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItemCount, setTotalItemCount] = useState(0);

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialSelectedDate);
  const [selectedPickupTime, setSelectedPickupTime] = useState<string>(initialSelectedPickupTime);
  const [unitNumber, setUnitNumber] = useState(initialUnitNumber);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(initialSendViaWhatsApp);
  const [isLoading, setIsLoading] = useState(true); // To prevent premature redirect on load

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) { // Show next 14 days
      dates.push(addDays(today, i));
    }
    return dates;
  }, []);

  const pickupTimeSlots = ["12:00 – 13:00", "18:00 – 19:00"];

  const getAvailableTimeSlots = useCallback((date: Date | null) => {
    if (!date) return [];
    const now = new Date();
    const leadTimeBoundary = addHours(now, PICKUP_LEAD_TIME_HOURS);

    return pickupTimeSlots.filter(slot => {
      const slotStartTimeString = slot.split(' – ')[0];
      const [hours, minutes] = slotStartTimeString.split(':').map(Number);
      // Important: Use the *selected date* for constructing slotDateTime
      const slotDateTime = setMilliseconds(setSeconds(setMinutes(setHours(new Date(date), hours), minutes), 0), 0);
      return isBefore(leadTimeBoundary, slotDateTime);
    });
  }, []);

  const [availableSlotsForSelectedDate, setAvailableSlotsForSelectedDate] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDate) {
      const newSlots = getAvailableTimeSlots(selectedDate);
      setAvailableSlotsForSelectedDate(newSlots);
      if (selectedPickupTime && !newSlots.includes(selectedPickupTime)) {
        setSelectedPickupTime(''); // Reset if current selection becomes invalid
      }
    } else {
      setAvailableSlotsForSelectedDate([]);
      setSelectedPickupTime('');
    }
  }, [selectedDate, selectedPickupTime, getAvailableTimeSlots]);

  // Load initial state from props (which should be from localStorage in parent)
  useEffect(() => {
    setTrayItems(initialTrayItems);
    setUnitNumber(initialUnitNumber);
    setSendViaWhatsApp(initialSendViaWhatsApp);
    setSelectedDate(initialSelectedDate);
    setSelectedPickupTime(initialSelectedPickupTime);
    setIsLoading(false);
  }, [initialTrayItems, initialUnitNumber, initialSendViaWhatsApp, initialSelectedDate, initialSelectedPickupTime]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALSTORAGE_UNIT_NUMBER_KEY, unitNumber);
    }
  }, [unitNumber]);

  const updateTotals = useCallback((items: OrderItem[]) => {
    const currentTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const currentItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    setTotalAmount(currentTotal);
    setTotalItemCount(currentItemCount);
    return { amount: currentTotal, count: currentItemCount };
  }, []);

  useEffect(() => {
    const totals = updateTotals(trayItems);
    if (typeof window !== 'undefined' && !isLoading) { 
        localStorage.setItem('good2go_cart', JSON.stringify(trayItems));
    }
    onStateChangeForParent({
      items: trayItems,
      pickupDate: selectedDate,
      pickupTime: selectedPickupTime,
      amount: totals.amount,
      count: totals.count,
      unit: unitNumber,
      sendWhatsApp: sendViaWhatsApp
    });

    if (trayItems.length === 0 && !isLoading) {
      toast({
        title: "Your List is Empty",
        description: "Your packing list is empty. Add some items first!",
        variant: "destructive",
        duration: 3000,
      });
      router.push('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trayItems, selectedDate, selectedPickupTime, unitNumber, sendViaWhatsApp, isLoading, onStateChangeForParent, router, toast, updateTotals]);


  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setTrayItems(currentItems => {
      let updatedItems;
      if (newQuantity <= 0) {
        updatedItems = currentItems.filter(item => item.productId !== productId);
        toast({
          title: "Item Removed",
          description: `${currentItems.find(item => item.productId === productId)?.name} removed from your packing list.`,
          duration: 2000,
        });
      } else {
        updatedItems = currentItems.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
      }
      return updatedItems;
    });
  };
  
  if (isLoading && initialTrayItems.length === 0) { 
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <Package className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 mt-4 text-lg text-muted-foreground">Loading your gear...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-none border-0 sm:shadow-xl sm:rounded-xl sm:border">
      <CardHeader className="text-center border-b pb-4">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
          <Package className="h-10 w-10 text-primary animate-bounce" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">Let’s Pack!</CardTitle>
        <CardDescription className="text-muted-foreground mt-1 px-2">You’re almost ready! Tweak your loadout and hit GO.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-foreground mb-3 pb-2 border-b flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" /> Your Stash
          </h3>
          <div className="space-y-0">
            {trayItems.map(item => (
              <TrayItemDisplay key={item.productId} item={item} onUpdateQuantity={handleUpdateQuantity} />
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-md font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />Select Pickup Date
          </Label>
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex space-x-3 pb-2">
              {availableDates.map(date => (
                <Button
                  key={date.toISOString()}
                  variant={selectedDate && isSameDay(selectedDate, date) ? 'default' : 'outline'}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "py-3 px-4 text-base h-auto rounded-md border-2 font-medium flex flex-col items-center justify-center min-w-[70px]",
                    selectedDate && isSameDay(selectedDate, date)
                      ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2 shadow-lg"
                      : "bg-background text-foreground border-input hover:bg-secondary/50"
                  )}
                >
                  <span className="text-xs">{format(date, 'EEE')}</span>
                  <span>{format(date, 'd')}</span>
                  <span className="text-xs">{format(date, 'MMM')}</span>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {selectedDate && (
          <div className="space-y-3 pt-2">
            <Label className="text-md font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />Select Pickup Time Slot
            </Label>
            {availableSlotsForSelectedDate.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSlotsForSelectedDate.map(time => (
                  <Button
                    key={time}
                    variant={selectedPickupTime === time ? 'default' : 'outline'}
                    onClick={() => setSelectedPickupTime(time)}
                    className={cn(
                      "py-3 text-base h-auto w-full justify-center rounded-md border-2 font-medium",
                      selectedPickupTime === time
                        ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2 shadow-lg"
                        : "bg-background text-foreground border-input hover:bg-secondary/50"
                    )}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2 px-3 bg-muted rounded-md">
                No available pickup slots for {format(selectedDate, 'MMMM d, yyyy')}. Please select another date.
              </p>
            )}
          </div>
        )}

        <div className="space-y-2 pt-2">
          <Label htmlFor="unitNumber" className="text-md font-semibold flex items-center gap-2 text-foreground">
            <HomeIcon className="h-5 w-5 text-primary" /> Unit/House No. (Optional)
          </Label>
          <Input
            id="unitNumber"
            type="text"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder="e.g., A-12-3 or Lot 123"
            className="h-12 text-base rounded-md border-input focus:border-primary focus:ring-primary"
          />
        </div>
        
        <Separator />

        <div className="flex items-center space-x-2 pt-3">
          <Checkbox
            id="sendWhatsApp"
            checked={sendViaWhatsApp}
            onCheckedChange={(checked) => setSendViaWhatsApp(checked as boolean)}
            className="h-5 w-5"
          />
          <Label htmlFor="sendWhatsApp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Send list via WhatsApp
          </Label>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground text-center pt-3 px-2 border-t mt-4">
          👉 After confirming, {sendViaWhatsApp ? "you'll be redirected to WhatsApp to send the pre-filled list." : "your list will be submitted for packing."}
        </p>
      </CardContent>
    </Card>
  );
}


export default function PackingPage() {
  const [trayItemsGlobal, setTrayItemsGlobal] = useState<OrderItem[]>([]);
  const [totalAmountGlobal, setTotalAmountGlobal] = useState(0);
  const [totalItemCountGlobal, setTotalItemCountGlobal] = useState(0);
  const [selectedDateGlobal, setSelectedDateGlobal] = useState<Date | null>(null);
  const [selectedPickupTimeGlobal, setSelectedPickupTimeGlobal] = useState<string>('');
  const [unitNumberGlobal, setUnitNumberGlobal] = useState('');
  const [sendViaWhatsAppGlobal, setSendViaWhatsAppGlobal] = useState(true); // Default to true
  const [isSubmittingGlobal, setIsSubmittingGlobal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [skipPreviewNextTime, setSkipPreviewNextTime] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);


  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let initialTray: OrderItem[] = [];
    let savedUnit = '';
    let savedSkipPreview = false;

    if (typeof window !== 'undefined') {
      const trayData = localStorage.getItem('good2go_cart');
      if (trayData) {
        try {
          initialTray = JSON.parse(trayData);
        } catch { console.error("Failed to parse tray from localStorage"); initialTray = []; }
      }
      savedUnit = localStorage.getItem(LOCALSTORAGE_UNIT_NUMBER_KEY) || '';
      savedSkipPreview = localStorage.getItem(LOCALSTORAGE_SKIP_PREVIEW_KEY) === 'true';
    }
    
    setTrayItemsGlobal(initialTray);
    setUnitNumberGlobal(savedUnit);
    setSkipPreviewNextTime(savedSkipPreview);
    // setSendViaWhatsAppGlobal is already true by default

    // Calculate initial totals
    const initialTotal = initialTray.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const initialItemCount = initialTray.reduce((sum, item) => sum + item.quantity, 0);
    setTotalAmountGlobal(initialTotal);
    setTotalItemCountGlobal(initialItemCount);


    if (initialTray.length === 0 && router.pathname === '/checkout') {
        toast({
          title: "Your Packing List is Empty",
          description: "Let's add some items first!",
          variant: "destructive",
          duration: 3000,
        });
        router.push('/');
        return; 
    }
    setIsInitialLoading(false);


    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'good2go_cart' || event.key === null) { 
            const currentCartData = localStorage.getItem('good2go_cart');
            let updatedCart: OrderItem[] = [];
            if (currentCartData) {
                try {
                    updatedCart = JSON.parse(currentCartData);
                } catch {}
            }
            setTrayItemsGlobal(updatedCart); // Update parent's tray state
            const newTotal = updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const newCount = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
            setTotalAmountGlobal(newTotal);
            setTotalItemCountGlobal(newCount);

            if (updatedCart.length === 0 && router.pathname === '/checkout') {
                toast({ title: "List Cleared", description: "Your packing list was cleared.", duration: 2000 });
                router.push('/');
            }
        }
        if (event.key === LOCALSTORAGE_UNIT_NUMBER_KEY || event.key === null) {
            setUnitNumberGlobal(localStorage.getItem(LOCALSTORAGE_UNIT_NUMBER_KEY) || '');
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router, toast]);


  const handleContentStateChange = useCallback((data: {
    items: OrderItem[],
    pickupDate: Date | null,
    pickupTime: string,
    amount: number,
    count: number,
    unit: string,
    sendWhatsApp: boolean
  }) => {
    setTrayItemsGlobal(data.items); 
    setSelectedDateGlobal(data.pickupDate);
    setSelectedPickupTimeGlobal(data.pickupTime);
    setTotalAmountGlobal(data.amount);
    setTotalItemCountGlobal(data.count);
    setUnitNumberGlobal(data.unit);
    setSendViaWhatsAppGlobal(data.sendWhatsApp);
  }, []);

  const handleFinalSubmit = async () => {
    setShowPreviewModal(false); 
    setIsSubmittingGlobal(true);

    const orderDataForFirebase = {
      items: trayItemsGlobal,
      totalAmount: totalAmountGlobal,
      pickupDate: selectedDateGlobal ? format(selectedDateGlobal, 'yyyy-MM-dd') : 'N/A',
      pickupTimeSlot: selectedPickupTimeGlobal,
      unitNumber: unitNumberGlobal.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      const firebaseResponse = await submitOrderToFirebase(orderDataForFirebase);
      if (!firebaseResponse.success) {
        throw new Error("Failed to submit packing list to backend.");
      }

      const queryParams = new URLSearchParams({
        itemsCount: totalItemCountGlobal.toString(),
        totalAmount: totalAmountGlobal.toFixed(2),
        pickupDate: selectedDateGlobal ? format(selectedDateGlobal, 'yyyy-MM-dd') : 'N/A',
        pickupTime: selectedPickupTimeGlobal,
        unit: unitNumberGlobal.trim() || '',
        orderId: firebaseResponse.orderId,
      });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('good2go_cart');
      }

      if (sendViaWhatsAppGlobal) {
        let packingDetails = "Hi Good2Go Express! I've packed my stash:\n\n";
        trayItemsGlobal.forEach(item => {
          let emoji = '🛍️';
          if (item.name.toLowerCase().includes('burger')) emoji = '🍔';
          else if (item.name.toLowerCase().includes('wrap')) emoji = '🌯';
          else if (item.name.toLowerCase().includes('smoothie') || item.name.toLowerCase().includes('brew') || item.name.toLowerCase().includes('drink')) emoji = '🥤';
          else if (item.name.toLowerCase().includes('bowl') || item.name.toLowerCase().includes('salad')) emoji = '🥗';
          packingDetails += `${emoji} ${item.name} × ${item.quantity} – RM ${item.price.toFixed(2)}\n`;
        });
        packingDetails += `\n💰 Total: RM ${totalAmountGlobal.toFixed(2)}\n`;
        packingDetails += `📦 Pickup: ${selectedDateGlobal ? format(selectedDateGlobal, 'MMM d, yyyy') : ''} ${selectedPickupTimeGlobal}\n`;
        if (unitNumberGlobal.trim()) {
          packingDetails += `🏠 Address: ${unitNumberGlobal.trim()}\n`;
        }
        packingDetails += `Ref: ${firebaseResponse.orderId}\n\nReady for pickup!`;

        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(packingDetails)}`;
        
        router.push(`/order-confirmation?${queryParams.toString()}`); 
        window.open(whatsappUrl, '_blank'); 

      } else {
         router.push(`/order-confirmation?${queryParams.toString()}`);
      }

    } catch (error) {
      console.error("Packing list submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an issue submitting your list. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      setIsSubmittingGlobal(false); 
    }
  };

  const handleGoButtonClick = () => {
    if (trayItemsGlobal.length === 0) {
      toast({ title: "List Empty", description: "Your packing list is empty. Add some items first!", variant: "destructive" });
      return;
    }
    if (!selectedDateGlobal || !selectedPickupTimeGlobal) {
      toast({ title: "Selection Needed", description: "Please select a pickup date and time slot.", variant: "destructive" });
      return;
    }

    if (skipPreviewNextTime) {
      handleFinalSubmit();
    } else {
      setShowPreviewModal(true);
    }
  };

  const handleToggleSkipPreview = (checked: boolean) => {
    setSkipPreviewNextTime(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALSTORAGE_SKIP_PREVIEW_KEY, checked ? 'true' : 'false');
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-0 sm:px-4 py-6 sm:py-8 flex items-center justify-center">
          <Package className="h-16 w-16 animate-spin text-primary" />
          <p className="ml-4 mt-4 text-xl text-muted-foreground">Loading your pack...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-6 sm:py-8 pb-28"> {/* pb-28 for fixed footer */}
        <Suspense fallback={
          <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
            <Package className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 mt-4 text-xl text-muted-foreground">Loading your awesome stash...</p>
          </div>
        }>
          <PackingPageContent
            onStateChangeForParent={handleContentStateChange}
            initialTrayItems={trayItemsGlobal}
            initialUnitNumber={unitNumberGlobal}
            initialSendViaWhatsApp={sendViaWhatsAppGlobal}
            initialSelectedDate={selectedDateGlobal}
            initialSelectedPickupTime={selectedPickupTimeGlobal}
          />
        </Suspense>
      </main>

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Package className="h-7 w-7 text-primary" />Preview Your Pack
            </DialogTitle>
            <DialogDescription>
              Double-check your items and pickup details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[50vh] overflow-y-auto">
            {trayItemsGlobal.map(item => {
               let emoji = '🛍️';
               if (item.name.toLowerCase().includes('burger')) emoji = '🍔';
               else if (item.name.toLowerCase().includes('wrap')) emoji = '🌯';
               else if (item.name.toLowerCase().includes('smoothie') || item.name.toLowerCase().includes('brew') || item.name.toLowerCase().includes('drink')) emoji = '🥤';
               else if (item.name.toLowerCase().includes('bowl') || item.name.toLowerCase().includes('salad')) emoji = '🥗';
              return (
                <div key={item.productId} className="flex justify-between items-center text-sm border-b pb-2">
                  <span>{emoji} {item.name} (x{item.quantity})</span>
                  <span className="font-medium">RM {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>RM {totalAmountGlobal.toFixed(2)}</span>
            </div>
            <Separator />
            <div>
              <p className="text-sm"><span className="font-medium">Pickup Date:</span> {selectedDateGlobal ? format(selectedDateGlobal, 'MMM d, yyyy (EEE)') : 'Not selected'}</p>
              <p className="text-sm"><span className="font-medium">Pickup Time:</span> {selectedPickupTimeGlobal || 'Not selected'}</p>
              {unitNumberGlobal && <p className="text-sm"><span className="font-medium">Unit/House No.:</span> {unitNumberGlobal}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox id="skipPreview" checked={skipPreviewNextTime} onCheckedChange={(checked) => handleToggleSkipPreview(checked as boolean)} />
            <Label htmlFor="skipPreview" className="text-xs text-muted-foreground">Don't show this preview again</Label>
          </div>
          <DialogFooter className="sm:justify-between gap-2 mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Pack
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleFinalSubmit} disabled={isSubmittingGlobal} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {isSubmittingGlobal ? <ShoppingBag className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
              Confirm & Submit Pack
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fixed Dual-Button Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] p-3 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg print:hidden">
        <div className="container mx-auto max-w-lg flex items-center justify-between gap-3">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1 h-14 text-md rounded-xl shadow-sm flex items-center justify-center gap-2"
            >
              <ShoppingCart className="mr-1 h-5 w-5" /> Shop More
            </Button>
            <Button
              onClick={handleGoButtonClick}
              disabled={isSubmittingGlobal || trayItemsGlobal.length === 0 || !selectedDateGlobal || !selectedPickupTimeGlobal}
              className="flex-[2_1_0%] h-14 text-md bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-150 ease-in-out active:scale-95"
            >
              {isSubmittingGlobal ? (
                <>
                  <ShoppingBag className="mr-2 h-6 w-6 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Rocket className="mr-1 h-5 w-5 group-hover:animate-pulse" />
                   Go (RM {totalAmountGlobal.toFixed(2)} | {totalItemCountGlobal} {totalItemCountGlobal === 1 ? 'item' : 'items'})
                </>
              )}
            </Button>
        </div>
      </div>
    </div>
  );
}

