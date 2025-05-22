
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // useSearchParams removed as it's less relevant now
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MessageSquare, Home, Package } from 'lucide-react';

const WHATSAPP_PHONE_NUMBER = '+60187693136'; 

function OrderConfirmationContent() {
  const router = useRouter();
  // Removed searchParams logic as order details are not passed via URL now

  const contactMessage = `Hi! I have a question about my recently submitted packing list.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(contactMessage)}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('good2go_cart'); // Clear the list
    }
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">List Submitted for Packing!</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Your items have been successfully submitted for packing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-secondary/30">
          <p className="text-base">
            We've received your list. It will be prepared for pickup at your selected time.
          </p>
           <p className="text-sm text-muted-foreground mt-2">
            You will receive a confirmation shortly if applicable. If you chose to send via WhatsApp, please ensure the message was sent.
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
            <Package className="h-12 w-12 animate-spin text-primary" /> {/* Changed icon */}
            <p className="ml-4 text-lg">Loading confirmation...</p>
        </div>
      }>
        <OrderConfirmationContent />
        </Suspense>
      </main>
    </div>
  );
}
