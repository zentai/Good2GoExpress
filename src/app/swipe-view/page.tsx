
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable, type SwipeEventData } from 'react-swipeable';
import { mockProducts } from '@/data/products';
import type { Product, OrderItem } from '@/lib/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { X, Plus, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const getProductIndexById = (id: string, products: Product[]): number => {
  return products.findIndex(p => p.id === id);
};

export default function SwipeViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [allProducts] = useState<Product[]>(mockProducts); // Removed setAllProducts as it's not used
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<'added' | 'skipped' | null>(null);
  const [animationKey, setAnimationKey] = useState(0);


  useEffect(() => {
    setIsLoading(true);
    const savedTray = localStorage.getItem('good2go_cart');
    if (savedTray) {
      try {
        const parsedTray: OrderItem[] = JSON.parse(savedTray);
        if (Array.isArray(parsedTray)) {
          setTrayItems(parsedTray);
        } else {
          setTrayItems([]);
        }
      } catch (e) {
        console.error("Failed to parse tray from localStorage", e);
        setTrayItems([]);
      }
    }

    const initialProductId = searchParams.get('productId');
    let initialIndex = 0;
    if (initialProductId) {
      const foundIndex = getProductIndexById(initialProductId, allProducts);
      if (foundIndex !== -1) {
        initialIndex = foundIndex;
      }
    }
    setCurrentIndex(initialIndex);
    setCurrentProduct(allProducts[initialIndex]);
    setAnimationKey(prev => prev + 1);
    setIsLoading(false);
  }, [searchParams, allProducts]);


  useEffect(() => {
    if (!isLoading && (trayItems.length > 0 || localStorage.getItem('good2go_cart') !== null)) {
      localStorage.setItem('good2go_cart', JSON.stringify(trayItems));
    }
  }, [trayItems, isLoading]);

  const advanceToNextProduct = useCallback(() => {
    setIsDescriptionExpanded(false); 
    
    setCurrentIndex(prevIndex => {
      const nextIdx = prevIndex + 1;
      if (nextIdx >= allProducts.length) {
        toast({
          title: "🎉 You've seen all items!",
          description: "Ready to pack your choices?",
          duration: 3000,
        });
        router.push('/checkout'); 
        return prevIndex; 
      }
      setCurrentProduct(allProducts[nextIdx]);
      setAnimationKey(prev => prev + 1);
      return nextIdx;
    });
  }, [allProducts, router, toast]);


  const handleAddToPack = useCallback(() => {
    if (!currentProduct || isItemInTray(currentProduct.id)) return;
    
    setActionFeedback('added');

    setTrayItems(prevItems => {
      const newItem: OrderItem = {
        productId: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        quantity: 1,
      };
      toast({
        title: `➕ "${currentProduct.name}" added to pack!`,
        duration: 1500,
      });
      return [...prevItems, newItem];
    });
    setTimeout(() => {
        advanceToNextProduct();
        setActionFeedback(null);
    }, 500); 
  }, [currentProduct, toast, advanceToNextProduct, trayItems]); // trayItems added to dependency array

  const handleSkip = useCallback(() => {
    if (!currentProduct) return;
    setActionFeedback('skipped');
    toast({
      title: `⏭️ Skipped "${currentProduct.name}"`,
      duration: 1500,
    });
     setTimeout(() => {
        advanceToNextProduct();
        setActionFeedback(null);
    }, 500); 
  }, [currentProduct, toast, advanceToNextProduct]);

  const toggleDescription = () => setIsDescriptionExpanded(!isDescriptionExpanded);

  const isItemInTray = useCallback(
    (productId: string) => trayItems.some(item => item.productId === productId),
    [trayItems]
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSkip(),
    onSwipedRight: () => handleAddToPack(),
    onSwipedUp: () => router.push('/checkout'),
    onSwipedDown: () => router.push('/'),
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 10, // Min distance in pixels to constitute a swipe
  });
  
  if (isLoading || !currentProduct) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <ShoppingBag className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  const currentProductEmoji = 
    currentProduct.name.toLowerCase().includes('burger') ? '🍔' :
    currentProduct.name.toLowerCase().includes('wrap') || currentProduct.name.toLowerCase().includes('bowl') || currentProduct.name.toLowerCase().includes('salad') ? '🍱' :
    currentProduct.name.toLowerCase().includes('smoothie') || currentProduct.name.toLowerCase().includes('brew') || currentProduct.name.toLowerCase().includes('drink') ? '🥤' :
    '🛍️';

  let cardAnimationClass = 'animate-fade-in'; 
  if (actionFeedback === 'added') {
    cardAnimationClass = 'animate-slide-out-right';
  } else if (actionFeedback === 'skipped') {
    cardAnimationClass = 'animate-slide-out-left';
  }


  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden antialiased">
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center py-2 bg-transparent">
         <Header />
      </div>

      <div 
        {...swipeHandlers} 
        className="flex-grow flex flex-col items-center justify-center pt-16 pb-28 relative touch-none" /* touch-none to prevent browser default touch actions like scroll/zoom */
      >
        {currentProduct && (
          <div key={animationKey} className={cn("w-full max-w-sm md:max-w-md flex flex-col items-center", cardAnimationClass)}>
            <div className="relative w-full aspect-[3/4] max-h-[65vh] bg-muted rounded-xl shadow-2xl overflow-hidden">
              <Image
                src={currentProduct.imageUrl}
                alt={currentProduct.name}
                fill
                priority
                className="object-cover pointer-events-none" /* pointer-events-none so image doesn't interfere with swipe on parent */
                data-ai-hint={currentProduct.dataAiHint || "product image"}
              />
              {currentProduct.badge && (
              <div
                  className={cn(
                  "absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-semibold shadow-lg",
                  currentProduct.badge.type === 'hot' && "bg-red-600 text-white",
                  currentProduct.badge.type === 'limited' && "bg-yellow-500 text-gray-900",
                  currentProduct.badge.type === 'signature' && "bg-primary text-primary-foreground",
                  currentProduct.badge.type === 'new' && "bg-blue-600 text-white",
                  currentProduct.badge.type === 'custom' && "bg-slate-700 text-white"
                  )}
              >
                  {currentProduct.badge.text}
              </div>
              )}
            </div>
            
            <div 
              className="w-full p-4 -mt-5 relative z-20" 
              onClick={toggleDescription} /* Keep click for description toggle, swipe handler is on parent */
            >
              <div className="p-4 bg-card rounded-lg shadow-lg cursor-pointer"> {/* Add cursor-pointer here */}
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold text-foreground mr-2">{currentProduct.name}</h2>
                  <p className="text-lg font-bold text-primary whitespace-nowrap">RM {currentProduct.price.toFixed(2)}</p>
                </div>
                
                <div className="mt-2 text-sm text-muted-foreground">
                  <p className={cn(!isDescriptionExpanded && "line-clamp-1")}>
                    {currentProduct.description || "Delicious and freshly prepared for you."}
                  </p>
                  {isDescriptionExpanded && (
                    <p className="mt-1 line-clamp-3">
                      {currentProductEmoji} Includes: Fresh Greens, Ripe Tomatoes, Quality Grains, and our special sauce that makes everything better! Perfect for a quick, healthy, and satisfying meal.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto max-w-md flex items-center justify-around gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-14 rounded-full shadow-md text-base font-medium border-2 hover:bg-muted active:scale-95"
            onClick={(e) => { e.stopPropagation(); handleSkip(); }}
            aria-label="Skip this product"
          >
            <X className="mr-1.5 h-5 w-5" /> Skip
          </Button>
          <Button
            size="lg"
            className={cn(
                "flex-1 h-14 rounded-full shadow-lg text-base font-medium text-accent-foreground active:scale-95",
                isItemInTray(currentProduct.id) ? "bg-green-600 hover:bg-green-700" : "bg-accent hover:bg-accent/90"
            )}
            onClick={(e) => { e.stopPropagation(); handleAddToPack(); }}
            disabled={isItemInTray(currentProduct.id)}
            aria-label={isItemInTray(currentProduct.id) ? `${currentProduct.name} is in pack` : `Add ${currentProduct.name} to pack`}
          >
            {isItemInTray(currentProduct.id) ? (
              <>
                <Plus className="mr-1.5 h-5 w-5" /> In Pack
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-5 w-5" /> Add to Pack
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
