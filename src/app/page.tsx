
'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import Header from '@/components/Header';
import SwipeableProductView from '@/components/SwipeableProductView';
import ProductGrid from '@/components/ProductGrid';
import { mockProducts } from '@/data/products';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, SquareStack } from 'lucide-react'; 

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('grid');
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-0 xs:px-2 sm:px-4 py-4">
        <Tabs defaultValue="grid" onValueChange={(value) => setViewMode(value as 'swipe' | 'grid')} className="w-full mb-6">
          <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" /> Grid View
            </TabsTrigger>
            <TabsTrigger value="swipe" className="flex items-center gap-2">
              <SquareStack className="h-5 w-5" /> Swipe View
            </TabsTrigger>
          </TabsList>
          <TabsContent value="grid" className="focus-visible:ring-0 focus-visible:ring-offset-0">
            <ProductGrid products={mockProducts} />
          </TabsContent>
          <TabsContent value="swipe" className="focus-visible:ring-0 focus-visible:ring-offset-0">
            <div className="flex justify-center">
              <SwipeableProductView products={mockProducts} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="bg-muted text-center py-4 text-sm text-muted-foreground border-t">
        {currentYear !== null ? (
          <p>&copy; {currentYear} Good2Go Express. All rights reserved.</p>
        ) : (
          <p>&copy; Good2Go Express. All rights reserved.</p> // Fallback or loading state for year
        )}
      </footer>
    </div>
  );
}
