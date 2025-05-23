
'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderItem } from '@/lib/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Home as HomeIcon, ShoppingBag, CheckCircle, MessageSquare, PlusCircle, MinusCircle, ArrowLeftCircle, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const WHATSAPP_PHONE_NUMBER = '+60187693136';
const LOCALSTORAGE_UNIT_NUMBER_KEY = 'good2go_unitNumber';

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

  // Determine a generic emoji based on category or name (simple example)
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
          <Button variant="outline" size="icon" onClick={handleDecrease} className="h-10 w-10 rounded-full hover:bg-secondary active:bg-secondary/80">
            <MinusCircle className="h-6 w-6 text-primary" />
          </Button>
          <span className="font-semibold text-xl w-8 text-center tabular-nums">{item.quantity}</span>
          <Button variant="outline" size="icon" onClick={handleIncrease} className="h-10 w-10 rounded-full hover:bg-secondary active:bg-secondary/80">
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

async function submitOrderToFirebase(orderData: {
  items: OrderItem[];
  totalAmount: number;
  pickupTime: string;
  unitNumber?: string;
  timestamp: string;
}) {
  console.log("Simulating order submission to Firebase for packing:", orderData);
  // In a real app, you'd use Firebase SDK here to write to Firestore or Realtime Database
  // For example: await addDoc(collection(db, "packingLists"), orderData);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, orderId: `mock_pack_list_${Date.now()}` };
}


function PackingPageContent({
  onStateChange,
  initialUnitNumber,
  initialSendViaWhatsApp,
  initialSelectedPickupTime
} : {
  onStateChange: (data: { items: OrderItem[], pickupTime: string, amount: number, count: number, isSubmittingGlobal: boolean, sendWhatsAppGlobal: boolean, unitGlobal: string }) => void;
  initialUnitNumber: string;
  initialSendViaWhatsApp: boolean;
  initialSelectedPickupTime: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItemCount, setTotalItemCount] = useState(0);
  const [selectedPickupTime, setSelectedPickupTime] = useState<string>(initialSelectedPickupTime);
  const [unitNumber, setUnitNumber] = useState(initialUnitNumber);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(initialSendViaWhatsApp);
  // isSubmitting is now managed by parent for the Go button
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUnitNumber = localStorage.getItem(LOCALSTORAGE_UNIT_NUMBER_KEY);
      if (savedUnitNumber) {
        setUnitNumber(savedUnitNumber);
      }
    }
  }, []); // Load unit number on mount

  useEffect(() => {
    if (typeof window !== 'undefined' && unitNumber) {
      localStorage.setItem(LOCALSTORAGE_UNIT_NUMBER_KEY, unitNumber);
    } else if (typeof window !== 'undefined' && !unitNumber) {
        localStorage.removeItem(LOCALSTORAGE_UNIT_NUMBER_KEY);
    }
  }, [unitNumber]);


  const updateTotals = useCallback((items: OrderItem[]) => {
    const currentTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const currentItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    setTotalAmount(currentTotal);
    setTotalItemCount(currentItemCount);
    return {amount: currentTotal, count: currentItemCount};
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTray = localStorage.getItem('good2go_cart');
      let currentItems: OrderItem[] = [];
      let currentAmount = 0;
      let currentItemCount = 0;

      if (savedTray) {
        try {
          const parsedTray: OrderItem[] = JSON.parse(savedTray);
          if (Array.isArray(parsedTray) && parsedTray.length > 0) {
            setTrayItems(parsedTray);
            const totals = updateTotals(parsedTray);
            currentItems = parsedTray;
            currentAmount = totals.amount;
            currentItemCount = totals.count;

          } else {
            setTrayItems([]);
            updateTotals([]);
            toast({
              title: "Your List is Empty",
              description: "Please add items to your list before packing.",
              variant: "destructive",
              duration: 4000,
            });
            router.push('/');
          }
        } catch (error) {
          console.error("Failed to parse list from localStorage:", error);
          setTrayItems([]);
          updateTotals([]);
          localStorage.removeItem('good2go_cart');
          toast({
            title: "Failed to Load List",
            description: "Could not load your list. Please try again.",
            variant: "destructive",
            duration: 4000,
          });
          router.push('/');
        }
      } else {
        setTrayItems([]);
        updateTotals([]);
        toast({
          title: "Your List is Empty",
          description: "It looks like you haven't selected any items yet.",
          variant: "destructive",
          duration: 4000,
        });
        router.push('/');
      }
      onStateChange({items: currentItems, pickupTime: selectedPickupTime, amount: currentAmount, count: currentItemCount, isSubmittingGlobal: false, sendWhatsAppGlobal: sendViaWhatsApp, unitGlobal: unitNumber});
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, toast, updateTotals]); // onStateChange dependency removed to prevent loops

  // Propagate changes to parent for the GO button
  useEffect(() => {
    onStateChange({items: trayItems, pickupTime: selectedPickupTime, amount: totalAmount, count: totalItemCount, isSubmittingGlobal: false /* managed by parent */, sendWhatsAppGlobal: sendViaWhatsApp, unitGlobal: unitNumber });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trayItems, selectedPickupTime, totalAmount, totalItemCount, sendViaWhatsApp, unitNumber]);


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
      if (typeof window !== 'undefined') {
        localStorage.setItem('good2go_cart', JSON.stringify(updatedItems));
      }
      updateTotals(updatedItems);
      return updatedItems;
    });
  };


  const pickupTimes = ["12:00 – 13:00", "18:00 – 19:00"];


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <Package className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 mt-4 text-lg text-muted-foreground">Loading your gear...</p>
      </div>
    );
  }

  // This empty state check is also handled by the parent for the GO button logic
  if (!isLoading && trayItems.length === 0 ) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl text-center py-10">
        <CardHeader>
            <Package className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
            <CardTitle className="text-2xl font-semibold text-destructive">Your Stash is Empty!</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">Go find some cool stuff to pack!</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => router.push('/')} className="mt-6">
                <ArrowLeftCircle className="mr-2 h-5 w-5" /> Back to Exploring
            </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl rounded-xl border-0 sm:border sm:rounded-xl">
      <CardHeader className="text-center border-b pb-4">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
            <Package className="h-10 w-10 text-primary animate-bounce" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">Let’s Pack!</CardTitle>
        <CardDescription className="text-muted-foreground mt-1 px-2">You’re almost ready! Tweak your loadout and hit GO.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="space-y-1 bg-secondary/30 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">Your Stash</h3>
          <div className="space-y-0"> {/* Natural flow for items */}
            {trayItems.map(item => (
              <TrayItemDisplay key={item.productId} item={item} onUpdateQuantity={handleUpdateQuantity} />
            ))}
          </div>
        </div>
        
        <div className="space-y-3 pt-2">
          <Label className="text-md font-semibold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />Select Pickup Time Slot
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pickupTimes.map(time => (
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
        </div>

        <div className="space-y-2 pt-2">
          <Label htmlFor="unitNumber" className="text-md font-semibold flex items-center gap-2 text-foreground">
            <HomeIcon className="h-5 w-5 text-primary" /> Unit/House No. (Optional)
          </Label>
          <Input
            id="unitNumber" // ID kept for potential label association
            type="text"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder="e.g., A-12-3 or Lot 123"
            className="h-12 text-base rounded-md border-input focus:border-primary focus:ring-primary"
          />
        </div>
        
        <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full h-12 text-base rounded-lg shadow-sm flex items-center justify-center gap-2 !mt-8" // Added !mt-8 for spacing
        >
            <ArrowLeftCircle className="mr-1 h-5 w-5" /> Continue Exploring
        </Button>

        <Separator />

        <div className="flex items-center space-x-2 pt-3">
          <Checkbox
            id="sendWhatsApp" // ID for label
            checked={sendViaWhatsApp}
            onCheckedChange={(checked) => setSendViaWhatsApp(checked as boolean)}
          />
          <Label htmlFor="sendWhatsApp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Send list via WhatsApp
          </Label>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground text-center pt-3 px-2 border-t mt-4">
          👉 After confirming, {sendViaWhatsApp ? "you'll be redirected to WhatsApp to send the pre-filled list." : "your list will be submitted for packing."}
        </p>
      </CardContent>
      {/* CardFooter is now managed by the parent for the fixed GO button */}
    </Card>
  );
}

export default function PackingPage() {
  const [pageKey, setPageKey] = useState(Date.now());
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItemCount, setTotalItemCount] = useState(0);
  const [isSubmittingGlobal, setIsSubmittingGlobal] = useState(false);
  const [trayItemsGlobal, setTrayItemsGlobal] = useState<OrderItem[]>([]);
  const [selectedPickupTimeGlobal, setSelectedPickupTimeGlobal] = useState<string>('');
  const [sendViaWhatsAppGlobal, setSendViaWhatsAppGlobal] = useState(true);
  const [unitNumberGlobal, setUnitNumberGlobal] = useState('');

  const router = useRouter();
  const { toast } = useToast();

   const handleContentStateChange = useCallback((data: { items: OrderItem[], pickupTime: string, amount: number, count: number, isSubmittingGlobal: boolean, sendWhatsAppGlobal: boolean, unitGlobal: string }) => {
    setTrayItemsGlobal(data.items);
    setSelectedPickupTimeGlobal(data.pickupTime);
    setTotalAmount(data.amount);
    setTotalItemCount(data.count);
    // setIsSubmittingGlobal(data.isSubmittingGlobal); // isSubmitting is local to the button handler
    setSendViaWhatsAppGlobal(data.sendWhatsAppGlobal);
    setUnitNumberGlobal(data.unitGlobal);
  }, []);

  useEffect(() => {
    // Initial load from localStorage or defaults for the GO button states
    const savedTray = localStorage.getItem('good2go_cart');
    if (savedTray) {
      try {
        const parsedTray: OrderItem[] = JSON.parse(savedTray);
        setTrayItemsGlobal(parsedTray);
        setTotalAmount(parsedTray.reduce((sum, item) => sum + item.price * item.quantity, 0));
        setTotalItemCount(parsedTray.reduce((sum, item) => sum + item.quantity, 0));
      } catch { /* ignore */ }
    }
    const savedUnit = localStorage.getItem(LOCALSTORAGE_UNIT_NUMBER_KEY);
    if (savedUnit) setUnitNumberGlobal(savedUnit);

    // Listen for cart changes potentially made by PackingPageContent (though it also calls onStateChange)
    const handleStorageChange = () => {
        const currentCart = localStorage.getItem('good2go_cart');
        if (currentCart) {
            try {
                const parsed: OrderItem[] = JSON.parse(currentCart);
                setTrayItemsGlobal(parsed);
                setTotalAmount(parsed.reduce((sum, item) => sum + item.price * item.quantity, 0));
                setTotalItemCount(parsed.reduce((sum, item) => sum + item.quantity, 0));
            } catch {}
        } else {
            setTrayItemsGlobal([]);
            setTotalAmount(0);
            setTotalItemCount(0);
        }
        const currentUnit = localStorage.getItem(LOCALSTORAGE_UNIT_NUMBER_KEY);
        if (currentUnit) setUnitNumberGlobal(currentUnit);

    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [pageKey]);


  const handleGoButtonClick = async () => {
    if (!selectedPickupTimeGlobal && trayItemsGlobal.length > 0) { // Only check if there are items
      toast({ title: "Selection Needed", description: "Please select a pickup time for your stash.", variant: "destructive" });
      return;
    }
    if (trayItemsGlobal.length === 0) {
      toast({ title: "List Empty", description: "Your packing list is empty. Add some items first!", variant: "destructive" });
      // router.push('/'); // Let user decide if they want to go back, button is disabled anyway.
      return;
    }

    setIsSubmittingGlobal(true);

    const packingDataForFirebase = {
      items: trayItemsGlobal,
      totalAmount: totalAmount,
      pickupTime: selectedPickupTimeGlobal,
      unitNumber: unitNumberGlobal.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      const firebaseResponse = await submitOrderToFirebase(packingDataForFirebase);
      if (!firebaseResponse.success) {
        throw new Error("Failed to submit packing list to backend.");
      }

      toast({
        title: "List Sent for Packing!",
        description: `Your stash (Ref: ${firebaseResponse.orderId}) is ready for action.`,
        variant: "default",
        duration: 5000,
      });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('good2go_cart');
        setPageKey(Date.now()); // Force re-fetch of cart for button state
      }

      if (sendViaWhatsAppGlobal) {
        let packingDetails = "Hi Good2Go Express! I've packed my stash:\n\n";
        trayItemsGlobal.forEach(item => {
          packingDetails += `🛒 ${item.name} × ${item.quantity} – RM ${item.price.toFixed(2)}\n`;
        });
        packingDetails += `\n💰 Total: RM ${totalAmount.toFixed(2)}\n`;
        packingDetails += `📦 Pickup Time: ${selectedPickupTimeGlobal}\n`;
        if (unitNumberGlobal.trim()) {
          packingDetails += `🏠 Address: ${unitNumberGlobal.trim()}\n`;
        }
        packingDetails += "\nReady for pickup!";

        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(packingDetails)}`;
        window.location.href = whatsappUrl;
      } else {
        router.push('/order-confirmation');
      }

    } catch (error) {
      console.error("Packing list submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an issue submitting your list. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      // Only set to false if not redirecting or if an error occurred
      if (!sendViaWhatsAppGlobal || packingDataForFirebase.items.length === 0) {
         setIsSubmittingGlobal(false);
      }
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main key={pageKey} className="flex-grow container mx-auto px-0 sm:px-4 py-6 sm:py-8 pb-28"> {/* pb-28 for fixed footer */}
        <Suspense fallback={
          <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
            <Package className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 mt-4 text-xl text-muted-foreground">Loading your awesome stash...</p>
          </div>
        }>
          <PackingPageContent
            onStateChange={handleContentStateChange}
            initialUnitNumber={unitNumberGlobal}
            initialSendViaWhatsApp={sendViaWhatsAppGlobal}
            initialSelectedPickupTime={selectedPickupTimeGlobal}
          />
        </Suspense>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-[60] p-3 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg print:hidden">
        <div className="container mx-auto max-w-lg flex items-center justify-center">
            <Button
              onClick={handleGoButtonClick}
              disabled={isSubmittingGlobal || trayItemsGlobal.length === 0 || !selectedPickupTimeGlobal}
              className="w-full h-16 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-150 ease-in-out active:scale-95"
            >
              {isSubmittingGlobal ? (
                <>
                  <ShoppingBag className="mr-2 h-6 w-6 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-6 w-6 group-hover:animate-pulse" />
                   Go ({totalItemCount > 0 ? `RM ${totalAmount.toFixed(2)} | ${totalItemCount} item${totalItemCount !== 1 ? 's' : ''}` : 'List Empty'})
                </>
              )}
            </Button>
        </div>
      </div>
    </div>
  );
}
      
