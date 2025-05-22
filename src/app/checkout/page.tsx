
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
import { Checkbox } from "@/components/ui/checkbox"
import { Package, Home as HomeIcon, ShoppingBag, CheckCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Define WhatsApp number here or import from a config file
const WHATSAPP_PHONE_NUMBER = '+60187693136'; // Example: Malaysian number. Replace with actual.

interface CartItemDisplayProps {
  item: OrderItem;
}

function CartItemDisplay({ item }: CartItemDisplayProps) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
      <div>
        <p className="font-medium text-foreground">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.quantity} &times; RM {item.price.toFixed(2)}
        </p>
      </div>
      <p className="font-semibold text-foreground">RM {(item.quantity * item.price).toFixed(2)}</p>
    </div>
  );
}

// Placeholder for Firebase submission
async function submitOrderToFirebase(orderData: {
  items: OrderItem[];
  totalAmount: number;
  pickupTime: string;
  unitNumber?: string;
  timestamp: string;
}) {
  console.log("Simulating order submission to Firebase:", orderData);
  // In a real application, you would use the Firebase SDK here
  // e.g., await addDoc(collection(db, "orders"), orderData);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  return { success: true, orderId: `mock_order_${Date.now()}` };
}


function CheckoutPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPickupTime, setSelectedPickupTime] = useState<string>('');
  const [unitNumber, setUnitNumber] = useState('');
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('good2go_cart');
      if (savedCart) {
        try {
          const parsedCart: OrderItem[] = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            setCartItems(parsedCart);
            const total = parsedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            setTotalAmount(total);
          } else {
            setCartItems([]);
            setTotalAmount(0);
            toast({
              title: "Your Cart is Empty",
              description: "Please add items to your cart before checking out.",
              variant: "destructive",
              duration: 4000,
            });
            router.push('/');
          }
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error);
          setCartItems([]);
          setTotalAmount(0);
          localStorage.removeItem('good2go_cart');
          toast({
            title: "Failed to Load Cart",
            description: "Could not load your cart. Please try again.",
            variant: "destructive",
            duration: 4000,
          });
          router.push('/');
        }
      } else {
        setCartItems([]);
        setTotalAmount(0);
        toast({
          title: "Your Cart is Empty",
          description: "It looks like you haven't added any items yet.",
          variant: "destructive",
          duration: 4000,
        });
        router.push('/');
      }
      setIsLoading(false);
    }
  }, [router, toast]);

  const pickupTimes = ["12:00 – 13:00", "18:00 – 19:00"];

  const handlePlaceOrder = async () => {
    if (!selectedPickupTime) {
      toast({ title: "Selection Needed", description: "Please select a pickup time.", variant: "destructive" });
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: "Cart Empty", description: "Please add items to your cart first.", variant: "destructive" });
      router.push('/');
      return;
    }

    setIsSubmitting(true);

    const orderDataForFirebase = {
      items: cartItems,
      totalAmount: totalAmount,
      pickupTime: selectedPickupTime,
      unitNumber: unitNumber.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      // Simulate Firebase submission
      const firebaseResponse = await submitOrderToFirebase(orderDataForFirebase);
      if (!firebaseResponse.success) {
        throw new Error("Failed to submit order to backend.");
      }
      
      toast({
        title: "Order Placed!",
        description: `Your order (ID: ${firebaseResponse.orderId}) has been successfully submitted.`,
        variant: "default",
        duration: 5000,
      });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('good2go_cart'); // Clear cart from localStorage after successful submission
      }

      if (sendViaWhatsApp) {
        let orderDetails = "Hi Good2Go Express, I'd like to place an order:\n\n";
        cartItems.forEach(item => {
          orderDetails += `🛒 ${item.name} × ${item.quantity} – RM ${item.price.toFixed(2)}\n`;
        });
        orderDetails += `\n💰 Total: RM ${totalAmount.toFixed(2)}\n`;
        orderDetails += `📦 Pickup Time: ${selectedPickupTime}\n`;
        if (unitNumber.trim()) {
          orderDetails += `🏠 Address: ${unitNumber.trim()}\n`;
        }
        orderDetails += "\nThank you!";

        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(orderDetails)}`;
        window.location.href = whatsappUrl;
        // User might not return, so further state changes might not be seen.
        // If they do return (e.g. by pressing back), the cart will be empty.
      } else {
        // If not sending to WhatsApp, maybe redirect to an order confirmation page or back to home
        router.push('/order-confirmation'); // Example: redirect to a generic confirmation
      }

    } catch (error) {
      console.error("Order submission error:", error);
      toast({
        title: "Order Failed",
        description: "There was an issue placing your order. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      // Only set isSubmitting to false if not redirecting to WhatsApp,
      // as WhatsApp redirection means the user leaves this page.
      if (!sendViaWhatsApp) {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <ShoppingBag className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 mt-4 text-lg text-muted-foreground">Loading your cart...</p>
      </div>
    );
  }

  if (!isLoading && cartItems.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl text-center py-10">
        <CardHeader>
            <ShoppingBag className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-semibold text-destructive">Your Cart is Empty</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">Please add some items to your cart first!</CardDescription>
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
            <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">Confirm Your Order</CardTitle>
        <CardDescription className="text-muted-foreground">Please review your items and select pickup details.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="space-y-1 bg-secondary/30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">Your Items</h3>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            {cartItems.map(item => (
              <CartItemDisplay key={item.productId} item={item} />
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between items-center pt-2">
            <p className="text-lg font-semibold text-foreground">Order Total:</p>
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
            Send order via WhatsApp
          </Label>
        </div>
        
        <p className="text-xs sm:text-sm text-muted-foreground text-center pt-3 px-2 border-t mt-4">
          👉 After confirming, {sendViaWhatsApp ? "you'll be redirected to WhatsApp to send the pre-filled order message." : "your order will be submitted."}
        </p>

      </CardContent>
      <CardFooter className="p-4 sm:p-6 border-t">
        <Button
          onClick={handlePlaceOrder}
          disabled={isSubmitting || cartItems.length === 0 || !selectedPickupTime}
          className="w-full h-14 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-md flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <ShoppingBag className="mr-2 h-5 w-5 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Package className="mr-2 h-5 w-5" /> Confirm & Place Order (RM {totalAmount.toFixed(2)})
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <Suspense fallback={
          <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
            <ShoppingBag className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 mt-4 text-xl text-muted-foreground">Preparing checkout...</p>
          </div>
        }>
          <CheckoutPageContent />
        </Suspense>
      </main>
    </div>
  );
}

