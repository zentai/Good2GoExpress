
'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { loadProductsFromFirestore } from '@/data/products'; // Updated import
import type { Product, OrderItem, ProductCategory, ProductCategorySlug } from '@/lib/types';
import FloatingCheckoutBar from '@/components/FloatingCheckoutBar';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        } catch (parseError) {
          console.error("Failed to parse tray from localStorage on HomePage mount:", parseError);
          localStorage.removeItem('good2go_cart');
        }
      }
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const products = await loadProductsFromFirestore();
        setAllProducts(products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
        setAllProducts([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(allProducts.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory, allProducts]);


  const handleToggleTrayItem = useCallback((product: Product) => {
    setTrayItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.productId === product.id);
      let updatedItems;

      if (existingItemIndex > -1) {
        updatedItems = prevItems.filter(item => item.productId !== product.id);
      } else {
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-0 xs:px-2 sm:px-4 py-4 pb-28">
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
        
        {isLoading && (
          <div className="grid grid-cols-1 xs:grid-cols-2 smd:grid-cols-3 gap-3 xs:gap-4 p-2 xs:p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="group rounded-lg overflow-hidden shadow-md bg-card flex flex-col" style={{ height: '244px' }}>
                <Skeleton className="h-44 bg-muted rounded-t-lg w-full" />
                <div className="p-3 space-y-2 flex-grow flex flex-col justify-center">
                  <Skeleton className="h-4 bg-muted rounded w-3/4" />
                  <Skeleton className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && error && (
          <p className="text-center text-destructive py-10">{error}</p>
        )}
        {!isLoading && !error && filteredProducts.length === 0 && (
           <p className="text-center text-muted-foreground py-10">No products found for this category.</p>
        )}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <ProductGrid 
            products={filteredProducts} 
            onToggleItemInList={handleToggleTrayItem} 
            trayItems={trayItems} 
          />
        )}
      </main>
      <FloatingCheckoutBar trayItems={trayItems} onClearTray={handleClearTray} />
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
