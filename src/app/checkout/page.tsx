
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
import { Package, Home as HomeIcon, ShoppingBag, CheckCircle, MessageSquare, PlusCircle, MinusCircle, ArrowLeftCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const WHATSAPP_PHONE_NUMBER = '+60187693136'; 

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

  return (
    <div className="py-4 border-b border-border last:border-b-0">
      <div className="flex justify-between items-start mb-1">
        <p className="font-medium text-foreground text-base">🛍️ {item.name}</p> {/* Generic Emoji */}
        <p className="font-semibold text-foreground text-base">
          RM {(item.quantity * item.price).toFixed(2)}
        </p>
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-sm text-muted-foreground">
          RM {item.price.toFixed(2)} &times; {item.quantity}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleDecrease} className="h-8 w-8 rounded-full hover:bg-secondary active:bg-secondary/80">
            <MinusCircle className="h-5 w-5 text-primary" />
          </Button>
          <span className="font-semibold text-lg w-6 text-center">{item.quantity}</span>
          <Button variant="ghost" size="icon" onClick={handleIncrease} className="h-8 w-8 rounded-full hover:bg-secondary active:bg-secondary/80">
            <PlusCircle className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>
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


function PackingPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItemCount, setTotalItemCount] = useState(0);
  const [selectedPickupTime, setSelectedPickupTime] = useState<string>('');
  const [unitNumber, setUnitNumber] = useState('');
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const updateTotals = useCallback((items: OrderItem[]) => {
    const currentTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const currentItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    setTotalAmount(currentTotal);
    setTotalItemCount(currentItemCount);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTray = localStorage.getItem('good2go_cart');
      if (savedTray) {
        try {
          const parsedTray: OrderItem[] = JSON.parse(savedTray);
          if (Array.isArray(parsedTray) && parsedTray.length > 0) {
            setTrayItems(parsedTray);
            updateTotals(parsedTray);
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
      setIsLoading(false);
    }
  }, [router, toast, updateTotals]);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setTrayItems(currentItems => {
      let updatedItems;
      if (newQuantity <= 0) {
        updatedItems = currentItems.filter(item => item.productId !== productId);
        toast({
            title: "Item Removed",
            description: "Item removed from your packing list.",
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
      updateTotals(updatedItems); // Recalculate totals
      return updatedItems;
    });
  };


  const pickupTimes = ["12:00 – 13:00", "18:00 – 19:00"];

  const handleConfirmPacking = async () => {
    if (!selectedPickupTime) {
      toast({ title: "Selection Needed", description: "Please select a pickup time for your stash.", variant: "destructive" });
      return;
    }
    if (trayItems.length === 0) {
      toast({ title: "List Empty", description: "Your packing list is empty. Add some items first!", variant: "destructive" });
      router.push('/');
      return;
    }

    setIsSubmitting(true);

    const packingDataForFirebase = {
      items: trayItems,
      totalAmount: totalAmount,
      pickupTime: selectedPickupTime,
      unitNumber: unitNumber.trim() || undefined,
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
      }

      if (sendViaWhatsApp) {
        let packingDetails = "Hi Good2Go Express! I've packed my stash:\n\n";
        trayItems.forEach(item => {
          packingDetails += `🛍️ ${item.name} × ${item.quantity} – RM ${item.price.toFixed(2)}\n`;
        });
        packingDetails += `\n💰 Total: RM ${totalAmount.toFixed(2)}\n`;
        packingDetails += `📦 Pickup Time: ${selectedPickupTime}\n`;
        if (unitNumber.trim()) {
          packingDetails += `🏠 Address: ${unitNumber.trim()}\n`;
        }
        packingDetails += "\nReady for pickup!";

        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(packingDetails)}`;
        window.location.href = whatsappUrl;
      } else {
        // Navigate to a generic confirmation page if not using WhatsApp
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
      // Only stop submitting animation if not redirecting to WhatsApp
      // as WhatsApp redirection will navigate away anyway.
      if (!sendViaWhatsApp) {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <Package className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 mt-4 text-lg text-muted-foreground">Loading your gear...</p>
      </div>
    );
  }

  if (!isLoading && trayItems.length === 0) {
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
    <Card className="w-full max-w-lg mx-auto shadow-xl rounded-xl">
      <CardHeader className="text-center border-b pb-4">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
            <Package className="h-10 w-10 text-primary animate-bounce" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">Let’s Pack! 📦</CardTitle>
        <CardDescription className="text-muted-foreground mt-1 px-2">You’re almost ready! Tweak your loadout and hit GO.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="space-y-1 bg-secondary/30 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">Your Stash</h3>
          <div className="max-h-[240px] sm:max-h-[300px] overflow-y-auto pr-2 space-y-0">
            {trayItems.map(item => (
              <TrayItemDisplay key={item.productId} item={item} onUpdateQuantity={handleUpdateQuantity} />
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between items-center pt-2 text-right">
            <span className="text-lg font-semibold text-foreground">🧾 Total:</span>
            <span className="text-xl font-bold text-accent">RM {totalAmount.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">&bull; {totalItemCount} items</span></span>
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
            id="unitNumber"
            type="text"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder="e.g., A-12-3 or Lot 123"
            className="h-12 text-base rounded-md border-input focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="flex items-center space-x-2 pt-3">
          <Checkbox 
            id="sendWhatsApp" 
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
      <CardFooter className="p-4 sm:p-6 border-t grid grid-cols-1 gap-3">
        <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full h-12 text-base rounded-lg shadow-sm flex items-center justify-center gap-2"
        >
            <ArrowLeftCircle className="mr-1 h-5 w-5" /> Continue Exploring
        </Button>
        <Button
          onClick={handleConfirmPacking}
          disabled={isSubmitting || trayItems.length === 0 || !selectedPickupTime}
          className="w-full h-14 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-md flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <ShoppingBag className="mr-2 h-5 w-5 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Package className="mr-2 h-5 w-5" /> 
              Pack & Proceed (RM {totalAmount.toFixed(2)})
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PackingPage() { // Renamed from CheckoutPage for conceptual alignment
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <Suspense fallback={
          <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
            <Package className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 mt-4 text-xl text-muted-foreground">Loading your awesome stash...</p>
          </div>
        }>
          <PackingPageContent />
        </Suspense>
      </main>
    </div>
  );
}
      
