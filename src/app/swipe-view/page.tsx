
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable, type SwipeEventData } from 'react-swipeable';
import { mockProducts } from '@/data/products';
import type { Product, OrderItem } from '@/lib/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { X, Plus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
// Toasts were removed as per previous request
// import { useToast } from '@/hooks/use-toast';

const getProductIndexById = (id: string, products: Product[]): number => {
  return products.findIndex(p => p.id === id);
};

export default function SwipeViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const { toast } = useToast(); // Toasts removed

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<'added' | 'skipped' | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setAllProducts(mockProducts);

    const savedTray = localStorage.getItem('good2go_cart');
    if (savedTray) {
      try {
        const parsedTray: OrderItem[] = JSON.parse(savedTray);
        setTrayItems(Array.isArray(parsedTray) ? parsedTray : []);
      } catch (e) {
        console.error("Failed to parse tray from localStorage", e);
        setTrayItems([]);
      }
    }

    const initialProductId = searchParams.get('productId');
    let initialIndex = 0;
    if (initialProductId && mockProducts.length > 0) {
      const foundIndex = getProductIndexById(initialProductId, mockProducts);
      if (foundIndex !== -1) {
        initialIndex = foundIndex;
      }
    }
    
    setCurrentIndex(initialIndex);
    if (mockProducts.length > 0) {
      setCurrentProduct(mockProducts[initialIndex] || mockProducts[0]);
    } else {
      setCurrentProduct(null);
    }
    setAnimationKey(prev => prev + 1);
    setIsLoading(false);
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && (trayItems.length > 0 || localStorage.getItem('good2go_cart') !== null)) {
      localStorage.setItem('good2go_cart', JSON.stringify(trayItems));
    }
  }, [trayItems, isLoading]);

  const scrollSwipeContainerToTop = () => {
    const container = document.querySelector('.main-swipe-container');
    if (container) {
      container.scrollTop = 0;
    }
  };

  const advanceToNextProduct = useCallback(() => {
    setIsDescriptionExpanded(false); // Collapse description for next card
    scrollSwipeContainerToTop(); // Scroll to top for the new card view
    
    setCurrentIndex(prevIndex => {
      const nextIdx = prevIndex + 1;
      if (nextIdx >= allProducts.length) {
        // No toast for end of list - Toasts removed
        router.push('/checkout');
        return prevIndex; 
      }
      setCurrentProduct(allProducts[nextIdx]);
      setAnimationKey(prev => prev + 1); 
      return nextIdx;
    });
  }, [allProducts, router]);


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
      return [...prevItems, newItem];
    });
    setTimeout(() => {
      advanceToNextProduct();
      setActionFeedback(null);
    }, 300);
  }, [currentProduct, advanceToNextProduct, trayItems, isItemInTray]); // Added isItemInTray

  const handleSkip = useCallback(() => {
    if (!currentProduct) return;
    setActionFeedback('skipped');
    setTimeout(() => {
      advanceToNextProduct();
      setActionFeedback(null);
    }, 300);
  }, [currentProduct, advanceToNextProduct]);

  const toggleDescription = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); 
    const nextState = !isDescriptionExpanded;
    setIsDescriptionExpanded(nextState);
    if (!nextState) { // If collapsing description
      scrollSwipeContainerToTop();
    }
  }, [isDescriptionExpanded]);
  
  const collapseDescription = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isDescriptionExpanded) {
      setIsDescriptionExpanded(false);
      scrollSwipeContainerToTop();
    }
  }, [isDescriptionExpanded]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function isItemInTray(productId: string): boolean {
    return trayItems.some(item => item.productId === productId);
  }


  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSkip,
    onSwipedRight: handleAddToPack,
    onSwipedUp: () => {
      if (isDescriptionExpanded) return; // Allow native scroll when description expanded
      router.push('/checkout');
    },
    onSwipedDown: () => {
      if (isDescriptionExpanded) return; // Allow native scroll when description expanded
      router.push('/');
    },
    preventScrollOnSwipe: !isDescriptionExpanded, // Dynamically prevent scroll based on description state
    trackMouse: true,
    delta: 10,
  });

  if (isLoading || !currentProduct) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <ShoppingBag className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading products...</p>
      </div>
    );
  }
  
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
        className={cn(
          "main-swipe-container flex-grow flex flex-col items-center pt-16 pb-28 relative touch-pan-y", // touch-pan-y to allow vertical scroll
          isDescriptionExpanded ? "overflow-y-auto justify-start" : "overflow-hidden justify-center"
        )}
      >
        {currentProduct && (
          <div 
            key={animationKey} 
            className={cn(
              "w-full max-w-sm md:max-w-md flex flex-col items-center", 
              cardAnimationClass,
              isDescriptionExpanded ? "pb-10" : "" // Add some padding at bottom when expanded
            )}
          >
            <div 
              className="relative w-full aspect-[3/4] max-h-[65vh] bg-muted rounded-xl shadow-2xl overflow-hidden"
              onClick={isDescriptionExpanded ? collapseDescription : undefined}
            >
              <Image
                src={currentProduct.imageUrl}
                alt={currentProduct.name}
                fill
                priority
                className="object-cover pointer-events-none"
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
              onClick={!isDescriptionExpanded ? toggleDescription : undefined} 
            >
              <div className={cn("p-4 bg-card rounded-lg shadow-lg", !isDescriptionExpanded && "cursor-pointer")}>
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold text-foreground mr-2">{currentProduct.name}</h2>
                  <p className="text-lg font-bold text-primary whitespace-nowrap">RM {currentProduct.price.toFixed(2)}</p>
                </div>
                
                <div className="mt-2 text-sm text-muted-foreground">
                  {!isDescriptionExpanded ? (
                    <p className="line-clamp-1">
                      {currentProduct.summary || currentProduct.description.split('.')[0] + '.'}
                    </p>
                  ) : (
                    <div
                      className="whitespace-pre-line text-xs leading-relaxed pt-2" // Removed max-h, overflow, specific bg/border
                      onClick={(e) => e.stopPropagation()} 
                      onTouchStart={(e) => e.stopPropagation()} 
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <p>{currentProduct.description}</p>
                    </div>
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
