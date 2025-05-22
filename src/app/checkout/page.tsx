
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderItem } from '@/lib/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Home as HomeIcon, ShoppingBag, CheckCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const WHATSAPP_PHONE_NUMBER = '+60187693136'; 

interface TrayItemDisplayProps {
  item: OrderItem;
}

function TrayItemDisplay({ item }: TrayItemDisplayProps) { // Renamed from CartItemDisplay
  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
      <div>
        <p className="font-medium text-foreground">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.quantity} &times; RM {item.price.toFixed(2)} {/* Assuming quantity is 1 for "interested" items for now */}
        </p>
      </div>
      <p className="font-semibold text-foreground">RM {(item.quantity * item.price).toFixed(2)}</p>
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
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  return { success: true, orderId: `mock_pack_list_${Date.now()}` };
}


function PackingPageContent() { // Renamed from CheckoutPageContent
  const router = useRouter();
  const { toast } = useToast();
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]); // Renamed from cartItems
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPickupTime, setSelectedPickupTime] = useState<string>('');
  const [unitNumber, setUnitNumber] = useState('');
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTray = localStorage.getItem('good2go_cart'); // Still using 'good2go_cart' key
      if (savedTray) {
        try {
          const parsedTray: OrderItem[] = JSON.parse(savedTray);
          if (Array.isArray(parsedTray) && parsedTray.length > 0) {
            setTrayItems(parsedTray);
            const total = parsedTray.reduce((sum, item) => sum + item.price * item.quantity, 0);
            setTotalAmount(total);
          } else {
            setTrayItems([]);
            setTotalAmount(0);
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
          setTotalAmount(0);
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
        setTotalAmount(0);
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
  }, [router, toast]);

  const pickupTimes = ["12:00 – 13:00", "18:00 – 19:00"];

  const handleConfirmPacking = async () => { // Renamed from handlePlaceOrder
    if (!selectedPickupTime) {
      toast({ title: "Selection Needed", description: "Please select a pickup time.", variant: "destructive" });
      return;
    }
    if (trayItems.length === 0) {
      toast({ title: "List Empty", description: "Please add items to your list first.", variant: "destructive" });
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
        description: `Your list (Ref: ${firebaseResponse.orderId}) has been submitted.`,
        variant: "default",
        duration: 5000,
      });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('good2go_cart'); 
      }

      if (sendViaWhatsApp) {
        let packingDetails = "Hi Good2Go Express, I'd like these items packed:\n\n";
        trayItems.forEach(item => {
          packingDetails += `❤️ ${item.name} × ${item.quantity} – RM ${item.price.toFixed(2)}\n`; // Using heart icon
        });
        packingDetails += `\n💰 Total: RM ${totalAmount.toFixed(2)}\n`;
        packingDetails += `📦 Pickup Time: ${selectedPickupTime}\n`;
        if (unitNumber.trim()) {
          packingDetails += `🏠 Address: ${unitNumber.trim()}\n`;
        }
        packingDetails += "\nThank you!";

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
      if (!sendViaWhatsApp) {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <Package className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 mt-4 text-lg text-muted-foreground">Loading your list...</p>
      </div>
    );
  }

  if (!isLoading && trayItems.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl text-center py-10">
        <CardHeader>
            <Package className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-semibold text-destructive">Your List is Empty</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">Please select some items first!</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => router.push('/')} className="mt-6">
                <HomeIcon className="mr-2 h-5 w-5" /> Back to Home
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl rounded-xl">
      <CardHeader className="text-center border-b pb-4">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
            <Package className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">Packing Your Items</CardTitle>
        <CardDescription className="text-muted-foreground">Confirm your list and select pickup details.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="space-y-1 bg-secondary/30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">Your Selected Items</h3>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            {trayItems.map(item => (
              <TrayItemDisplay key={item.productId} item={item} />
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between items-center pt-2">
            <p className="text-lg font-semibold text-foreground">List Total:</p>
            <p className="text-2xl font-bold text-accent">RM {totalAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="space-y-3 pt-2">
          <Label className="text-md font-semibold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />Select Pickup Time
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
      <CardFooter className="p-4 sm:p-6 border-t">
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
              {sendViaWhatsApp ? <MessageSquare className="mr-2 h-5 w-5" /> : <Package className="mr-2 h-5 w-5" /> }
              Confirm & Place Order (RM {totalAmount.toFixed(2)})
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CheckoutPage() { // Still named CheckoutPage for routing, but content is "Packing"
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <Suspense fallback={
          <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
            <Package className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 mt-4 text-xl text-muted-foreground">Preparing your list...</p>
          </div>
        }>
          <PackingPageContent />
        </Suspense>
      </main>
    </div>
  );
}
