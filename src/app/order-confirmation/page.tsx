
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, RefreshCw, Package } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orderDetails, setOrderDetails] = useState({
    itemsCount: '0',
    totalAmount: '0.00',
    pickupDate: '',
    pickupTime: '',
    unit: '',
    orderId: ''
  });

  useEffect(() => {
    // Clear the cart from localStorage once the list is confirmed
    if (typeof window !== 'undefined') {
        localStorage.removeItem('good2go_cart'); 
    }

    setOrderDetails({
      itemsCount: searchParams.get('itemsCount') || '0',
      totalAmount: searchParams.get('totalAmount') || '0.00',
      pickupDate: searchParams.get('pickupDate') || '',
      pickupTime: searchParams.get('pickupTime') || '',
      unit: searchParams.get('unit') || '',
      orderId: searchParams.get('orderId') || 'N/A'
    });
  }, [searchParams]);

  const formattedDate = orderDetails.pickupDate && orderDetails.pickupDate !== 'N/A' 
    ? format(parseISO(orderDetails.pickupDate), 'MMM d, yyyy (EEE)') 
    : 'N/A';

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
          <CheckCircle className="h-20 w-20 text-primary animate-pulse" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">🎉 Pack Confirmed!</CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2 px-4">
          You’ve packed {orderDetails.itemsCount} item{orderDetails.itemsCount !== '1' ? 's' : ''} for RM {orderDetails.totalAmount}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-8">
        <div className="p-4 border rounded-lg bg-secondary/30 text-left space-y-1">
          <p className="text-base">
            <span className="font-semibold">Ref ID:</span> {orderDetails.orderId}
          </p>
          <p className="text-base">
            <span className="font-semibold">Pickup between:</span><br/> 
            {formattedDate}, {orderDetails.pickupTime || 'N/A'}
          </p>
          {orderDetails.unit && (
            <p className="text-base">
              <span className="font-semibold">Unit/House No.:</span> {orderDetails.unit}
            </p>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          Your list has been submitted for packing. Get ready for your pickup!
        </p>
        
        <Button 
          onClick={() => {
            // Clear cart again just in case and navigate
            if (typeof window !== 'undefined') localStorage.removeItem('good2go_cart');
            router.push('/checkout');
          }}
          variant="default"
          className="w-full h-12 text-base bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-md flex items-center gap-2"
        >
          <RefreshCw className="h-5 w-5" /> Start New Pack
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
            <Package className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading confirmation...</p>
        </div>
      }>
        <OrderConfirmationContent />
        </Suspense>
      </main>
    </div>
  );
}

