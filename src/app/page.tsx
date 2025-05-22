
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SwipeableProductView from '@/components/SwipeableProductView';
import ProductGrid from '@/components/ProductGrid';
import { mockProducts } from '@/data/products';
import type { Product, OrderItem } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, SquareStack } from 'lucide-react';
import FloatingCheckoutBar from '@/components/FloatingCheckoutBar';
// useToast is not directly used here anymore for adding items, it's in ProductCard

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('grid');
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]); // Renamed from cartItems

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    if (typeof window !== 'undefined') {
      const savedTray = localStorage.getItem('good2go_cart'); // Keep localStorage key for now
      if (savedTray) {
        try {
          const parsedTray = JSON.parse(savedTray);
          if (Array.isArray(parsedTray)) {
            setTrayItems(parsedTray as OrderItem[]);
          }
        } catch (error) {
          console.error("Failed to parse tray from localStorage on HomePage mount:", error);
          localStorage.removeItem('good2go_cart');
        }
      }
    }
  }, []);

  const handleToggleTrayItem = (product: Product) => {
    setTrayItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.productId === product.id);
      let updatedItems;

      if (existingItemIndex > -1) {
        // Item exists, remove it
        updatedItems = prevItems.filter(item => item.productId !== product.id);
      } else {
        // Item does not exist, add it
        updatedItems = [...prevItems, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('good2go_cart', JSON.stringify(updatedItems));
      }
      return updatedItems;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-0 xs:px-2 sm:px-4 py-4 pb-28">
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
            <ProductGrid 
              products={mockProducts} 
              onToggleItemInList={handleToggleTrayItem} 
              trayItems={trayItems} 
            />
          </TabsContent>
          <TabsContent value="swipe" className="focus-visible:ring-0 focus-visible:ring-offset-0">
            <div className="flex justify-center">
              <SwipeableProductView 
                products={mockProducts} 
                onToggleItemInList={handleToggleTrayItem} 
                trayItems={trayItems} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <FloatingCheckoutBar trayItems={trayItems} /> {/* Pass trayItems */}
      <footer className="bg-muted text-center py-4 text-sm text-muted-foreground border-t">
        {currentYear !== null ? (
          <p>&copy; {currentYear} Good2Go Express. All rights reserved.</p>
        ) : (
          <p>&copy; Good2Go Express. All rights reserved.</p>
        )}
      </footer>
    </div>
  );
}
