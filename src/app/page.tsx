
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SwipeableProductView from '@/components/SwipeableProductView';
import ProductGrid from '@/components/ProductGrid';
import { mockProducts } from '@/data/products'; // Assuming mockProducts might be dynamic in future
import type { Product, OrderItem } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, SquareStack } from 'lucide-react';
import FloatingCheckoutBar from '@/components/FloatingCheckoutBar';
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('grid');
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    // Load cart from localStorage on initial mount
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('good2go_cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart as OrderItem[]);
          }
        } catch (error) {
          console.error("Failed to parse cart from localStorage on HomePage mount:", error);
          localStorage.removeItem('good2go_cart'); // Clear corrupted data
        }
      }
    }
  }, []);

  const handleAddToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.productId === product.id);
      let updatedItems;
      if (existingItemIndex > -1) {
        // Increase quantity of existing item
        updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
      } else {
        // Add new item with quantity 1
        updatedItems = [...prevItems, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
      }
      // Save updated cart to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('good2go_cart', JSON.stringify(updatedItems));
      }
      return updatedItems;
    });

    // Toast notification from ProductCard.tsx handles this, but if global feedback needed, can add here.
    // For now, ProductCard's toast is sufficient for individual item add.
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-0 xs:px-2 sm:px-4 py-4 pb-28"> {/* Added pb-28 for spacing above floating bar */}
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
            <ProductGrid products={mockProducts} onAddToCart={handleAddToCart} />
          </TabsContent>
          <TabsContent value="swipe" className="focus-visible:ring-0 focus-visible:ring-offset-0">
            <div className="flex justify-center">
              {/* If SwipeableProductView also needs add to cart, pass handleAddToCart here too */}
              {/* For now, assuming SwipeableProductView's ProductCard handles its own add to cart via props or context */}
              <SwipeableProductView products={mockProducts} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <FloatingCheckoutBar cartItems={cartItems} /> {/* Pass cartItems */}
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
