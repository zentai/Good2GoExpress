
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MessageSquare, Home, ShoppingBag } from 'lucide-react'; // MessageSquare for WhatsApp

// Define a placeholder phone number for WhatsApp
const WHATSAPP_PHONE_NUMBER = '+6596100333'; // Replace with actual number or make configurable

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productName = searchParams.get('productName') || 'Your Item';
  const price = searchParams.get('price') || '0.00';
  const pickupTime = searchParams.get('pickupTime') || 'asap';

  const formattedPickupTime = pickupTime === 'asap' ? 'as soon as possible' : `in ${pickupTime.replace('hr', ' hour').replace('min', ' minutes')}`;

  const orderMessage = `Hi! I've placed an order for ${productName} (Price: RM ${price}). Pickup: ${formattedPickupTime}. Order from Good2Go Express.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(orderMessage)}`;

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">Order Confirmed!</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Your order for <span className="font-semibold text-foreground">{productName}</span> is confirmed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-secondary/30">
          <p className="text-base">
            It will be ready for pickup <span className="font-semibold text-foreground">{formattedPickupTime}</span>.
          </p>
          <p className="text-xl font-bold text-accent mt-1">Total: RM {parseFloat(price).toFixed(2)}</p>
        </div>
        
        <p className="text-sm text-muted-foreground">
          You can also confirm your order details or ask questions via WhatsApp.
        </p>

        <Button 
          asChild 
          className="w-full h-12 text-base bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md flex items-center gap-2"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageSquare className="h-5 w-5" /> Chat on WhatsApp
          </a>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => router.push('/')} 
          className="w-full h-12 text-base rounded-lg flex items-center gap-2"
        >
          <Home className="h-5 w-5" /> Back to Home
        </Button>
      </CardContent>
    </Card>
  );
}


export default function OrderConfirmationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
      <Suspense fallback={<div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]"><ShoppingBag className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg">Loading confirmation...</p></div>}>
        <OrderConfirmationContent />
        </Suspense>
      </main>
    </div>
  );
}
