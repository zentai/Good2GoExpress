'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import SwipeableProductView from '@/components/SwipeableProductView';
import ProductGrid from '@/components/ProductGrid';
import { mockProducts } from '@/data/products';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, SquareStack } from 'lucide-react'; // SquareStack can represent swipe view

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('grid');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4">
        <Tabs defaultValue="grid" onValueChange={(value) => setViewMode(value as 'swipe' | 'grid')} className="w-full mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" /> Grid View
            </TabsTrigger>
            <TabsTrigger value="swipe" className="flex items-center gap-2">
              <SquareStack className="h-5 w-5" /> Swipe View
            </TabsTrigger>
          </TabsList>
          <TabsContent value="grid">
            <ProductGrid products={mockProducts} />
          </TabsContent>
          <TabsContent value="swipe">
            <div className="flex justify-center">
              <SwipeableProductView products={mockProducts} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="bg-gray-100 dark:bg-gray-800 text-center py-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Good2Go Express. All rights reserved.</p>
      </footer>
    </div>
  );
}
