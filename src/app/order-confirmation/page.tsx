
'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MessageSquare, Home, ShoppingBag } from 'lucide-react';

// This page might become a more generic "Order Submitted" page if WhatsApp is optional.
// For now, keeping the WhatsApp chat button, but its relevance depends on the checkout flow.

const WHATSAPP_PHONE_NUMBER = '+60187693136'; // Ensure this is defined or imported

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // These params might not be relevant if navigating here after Firebase submission without WhatsApp
  const productName = searchParams.get('productName') || 'Your Order'; 
  const price = searchParams.get('price') || 'N/A'; // Default if not passed
  const pickupTime = searchParams.get('pickupTime') || 'your selected time';

  const formattedPickupTime = pickupTime; // Simplified as actual time is now passed or not needed

  // Construct a generic message if order details are not passed via params
  const orderMessage = `Hi! I have a question about my recent order placed via Good2Go Express.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(orderMessage)}`;

  useEffect(() => {
    // Clear cart from localStorage if the user lands here.
    // This is a fallback, should ideally be cleared upon successful submission.
    if (typeof window !== 'undefined') {
        localStorage.removeItem('good2go_cart');
    }
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">Order Submitted!</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Your order has been successfully submitted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-secondary/30">
          <p className="text-base">
            We've received your order. It will be ready for pickup at {formattedPickupTime}.
          </p>
          {price !== 'N/A' && (
            <p className="text-xl font-bold text-accent mt-1">Total: RM {parseFloat(price).toFixed(2)}</p>
          )}
           <p className="text-sm text-muted-foreground mt-2">
            You will receive a confirmation shortly. If you chose to send via WhatsApp, please ensure the message was sent.
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground">
          For any urgent queries, you can contact us on WhatsApp.
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
      <Suspense fallback={
        <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]">
            <ShoppingBag className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading confirmation...</p>
        </div>
      }>
        <OrderConfirmationContent />
        </Suspense>
      </main>
    </div>
  );
}
