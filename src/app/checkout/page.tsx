
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { mockProducts } from '@/data/products';
import type { Product } from '@/lib/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Send, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const productId = searchParams.get('productId');
  
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined for loading state
  const [pickupTime, setPickupTime] = useState<string>('asap');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      const foundProduct = mockProducts.find(p => p.id === productId);
      setProduct(foundProduct || null); // null if not found
    } else {
      setProduct(null); // No productId, so no product
    }
  }, [productId]);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Order Submitted!',
        description: `${product.name} will be ready for pickup ${pickupTime === 'asap' ? 'as soon as possible' : `in ${pickupTime}`}.`,
      });
      
      // Navigate to order confirmation page with order details
      // For simplicity, passing limited info. A real app might pass an order ID.
      router.push(`/order-confirmation?productName=${encodeURIComponent(product.name)}&price=${product.price}&pickupTime=${encodeURIComponent(pickupTime)}`);
      setIsSubmitting(false);
    }, 1000);
  };

  if (product === undefined) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]">
        <ShoppingBag className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you're trying to order doesn't exist or is unavailable.</p>
        <Button onClick={() => router.push('/')}>Back to Products</Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Review Your Order</CardTitle>
        <CardDescription>Confirm your item and select a pickup time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-secondary/30">
          <div className="relative w-32 h-32">
            <Image src={product.imageUrl} alt={product.name} fill className="rounded-md object-cover" data-ai-hint={product.dataAiHint}/>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-xl font-bold text-accent">RM {product.price.toFixed(2)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="space-y-6">
          <div>
            <Label htmlFor="pickupTime" className="text-md font-medium flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" /> Pickup Time
            </Label>
            <Select value={pickupTime} onValueChange={setPickupTime}>
              <SelectTrigger id="pickupTime" className="w-full h-12 text-base">
                <SelectValue placeholder="Select pickup time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">As soon as possible</SelectItem>
                <SelectItem value="30min">In 30 minutes</SelectItem>
                <SelectItem value="1hr">In 1 hour</SelectItem>
                <SelectItem value="2hr">In 2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Spacer to push button to bottom on mobile view, might not need CSS for fixed bottom effect */}
          <div className="pt-8"> 
            <Button type="submit" className="w-full h-14 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-md" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Send className="mr-2 h-5 w-5 animate-pulse" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" /> Confirm & Place Order
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <Suspense fallback={<div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]"><ShoppingBag className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg">Loading checkout...</p></div>}>
          <CheckoutPageContent />
        </Suspense>
      </main>
    </div>
  );
}
