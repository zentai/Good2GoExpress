
'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { mockProducts } from '@/data/products';
import type { Product, OrderItem, ProductCategory, ProductCategorySlug } from '@/lib/types';
import FloatingCheckoutBar from '@/components/FloatingCheckoutBar';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';

const categories: ProductCategory[] = [
  { name: "✨ All Items", slug: "all" as ProductCategorySlug },
  { name: "🍿 Snack Attack", slug: "snack-attack" },
  { name: "🧃 Thirst Quenchers", slug: "thirst-quenchers" },
  { name: "🧴 Everyday Essentials", slug: "everyday-essentials" },
  { name: "🔌 Home Helpers", slug: "home-helpers" },
  { name: "🏕️ Camp & Go", slug: "camp-go" },
  { name: "📦 Best Bundles", slug: "best-bundles" },
];

export default function HomePage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategorySlug>("all");

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    if (typeof window !== 'undefined') {
      const savedTray = localStorage.getItem('good2go_cart');
      if (savedTray) {
        try {
          const parsedTray = JSON.parse(savedTray);
          if (Array.isArray(parsedTray)) {
            setTrayItems(parsedTray as OrderItem[]);
          }
        } catch (error) {
          console.error("Failed to parse tray from localStorage on HomePage mount:", error);
          localStorage.removeItem('good2go_cart'); // Clear corrupted data
        }
      }
    }
  }, []);

  const handleToggleTrayItem = useCallback((product: Product) => {
    setTrayItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.productId === product.id);
      let updatedItems;

      if (existingItemIndex > -1) {
        // Item exists, remove it
        updatedItems = prevItems.filter(item => item.productId !== product.id);
      } else {
        // Item doesn't exist, add it with quantity 1
        updatedItems = [...prevItems, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('good2go_cart', JSON.stringify(updatedItems));
      }
      return updatedItems;
    });
  }, []);

  const handleClearTray = () => {
    setTrayItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('good2go_cart');
    }
    // No toast for clearing as per prior request to remove toasts for add/remove actions
  };

  const filteredProducts = selectedCategory === "all"
    ? mockProducts
    : mockProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-0 xs:px-2 sm:px-4 py-4 pb-28"> {/* Added pb-28 for FloatingCheckoutBar */}
        <div className="px-2 sm:px-0 mb-6">
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex w-max space-x-2 p-1.5">
              {categories.map((category) => (
                <Button
                  key={category.slug}
                  variant={selectedCategory === category.slug ? 'default' : 'outline'}
                  className={cn(
                    "rounded-full h-9 px-4 text-sm shadow-sm",
                    selectedCategory === category.slug
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-card text-primary border-primary hover:bg-primary/10"
                  )}
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        
        <ProductGrid 
          products={filteredProducts} 
          onToggleItemInList={handleToggleTrayItem} 
          trayItems={trayItems} 
        />
      </main>
      <FloatingCheckoutBar trayItems={trayItems} onClearTray={handleClearTray} />
      <footer className="bg-muted text-center py-4 text-sm text-muted-foreground border-t">
        {currentYear !== null ? (
          <p>&copy; {currentYear} Good2Go Express. All rights reserved.</p>
        ) : (
          // Fallback or loading state for the year
          <p>&copy; Good2Go Express. All rights reserved.</p> 
        )}
      </footer>
    </div>
  );
}
