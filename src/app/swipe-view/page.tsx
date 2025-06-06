
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import { loadProductsFromFirestore } from '@/data/products';
import type { Product, OrderItem } from '@/lib/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ChevronLeft, ChevronRight as ChevronRightIcon, ImageOff, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const getProductIndexById = (id: string, products: Product[]): number => {
  return products.findIndex(p => p.id === id);
};

function SwipeViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<'added' | 'skipped' | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const savedTray = localStorage.getItem('good2go_cart');
    if (savedTray) {
      try {
        const parsedTray: OrderItem[] = JSON.parse(savedTray);
        setTrayItems(Array.isArray(parsedTray) ? parsedTray : []);
      } catch (e) {
        console.error("Failed to parse tray from localStorage", e);
        setTrayItems([]);
        localStorage.removeItem('good2go_cart');
      }
    }
  }, []);

  useEffect(() => {
    const fetchAndSetProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const products = await loadProductsFromFirestore();
        setAllProducts(products);

        if (products.length > 0) {
          const initialProductId = searchParams.get('productId');
          let initialIndex = 0;
          if (initialProductId) {
            const foundIndex = getProductIndexById(initialProductId, products);
            if (foundIndex !== -1) {
              initialIndex = foundIndex;
            }
          }
          setCurrentIndex(initialIndex);
          setCurrentProduct(products[initialIndex] || products[0]);
          setAnimationKey(prev => prev + 1);
          setCurrentImageIndex(0);
          setIsDescriptionExpanded(false);
        } else {
          setCurrentProduct(null);
        }
      } catch (err) {
        console.error("Failed to fetch products for swipe view:", err);
        setError("Failed to load products. Please try again later.");
        setAllProducts([]);
        setCurrentProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); 

  useEffect(() => {
    if (!isLoading && (trayItems.length > 0 || localStorage.getItem('good2go_cart') !== JSON.stringify(trayItems))) {
       if (localStorage.getItem('good2go_cart') !== JSON.stringify(trayItems)) { // Only save if different
          localStorage.setItem('good2go_cart', JSON.stringify(trayItems));
      }
    }
  }, [trayItems, isLoading]);

  const scrollSwipeContainerToTop = useCallback(() => {
    const container = document.querySelector('.main-swipe-container');
    if (container) {
      container.scrollTop = 0;
    }
  }, []);

  const advanceToNextProduct = useCallback(() => {
    scrollSwipeContainerToTop();
    setCurrentImageIndex(0);
    setIsDescriptionExpanded(false);
    
    setCurrentIndex(prevIndex => {
      const nextIdx = prevIndex + 1;
      if (nextIdx >= allProducts.length) {
        router.push('/checkout'); 
        return prevIndex; 
      }
      setCurrentProduct(allProducts[nextIdx]);
      setAnimationKey(prev => prev + 1); 
      return nextIdx;
    });
  }, [allProducts, router, scrollSwipeContainerToTop]);


  const isItemInTray = useCallback((productId: string): boolean => {
    return trayItems.some(item => item.productId === productId);
  }, [trayItems]);

  const handleAddToPack = useCallback(() => {
    if (!currentProduct || currentProduct.status === 'out-of-stock' || isItemInTray(currentProduct.id)) return;
    setActionFeedback('added');
    setTrayItems(prevItems => {
      const newItem: OrderItem = {
        productId: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        quantity: 1,
      };
      const existing = prevItems.find(item => item.productId === currentProduct.id);
      if (existing) return prevItems; // Should not happen if isItemInTray is checked before call
      return [...prevItems, newItem];
    });
    setTimeout(() => {
      advanceToNextProduct();
      setActionFeedback(null);
    }, 300);
  }, [currentProduct, advanceToNextProduct, isItemInTray]);

  const handleSkip = useCallback(() => {
    if (!currentProduct) return;
    setActionFeedback('skipped');
    setTimeout(() => {
      advanceToNextProduct();
      setActionFeedback(null);
    }, 300);
  }, [currentProduct, advanceToNextProduct]);

  const toggleDescription = useCallback(() => {
    const nextState = !isDescriptionExpanded;
    setIsDescriptionExpanded(nextState);
    if (!nextState) { 
      scrollSwipeContainerToTop();
    }
  }, [isDescriptionExpanded, scrollSwipeContainerToTop]);
  
  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      if (isDescriptionExpanded && eventData.event.target instanceof HTMLElement && eventData.event.target.closest('.scrollable-description')) return;
      handleSkip();
    },
    onSwipedRight: (eventData) => {
      if (isDescriptionExpanded && eventData.event.target instanceof HTMLElement && eventData.event.target.closest('.scrollable-description')) return;
      if (currentProduct && currentProduct.status !== 'out-of-stock') {
        handleAddToPack();
      }
    },
    onSwipedUp: () => {
      if (isDescriptionExpanded) return;
      router.push('/checkout');
    },
    onSwipedDown: () => {
      if (isDescriptionExpanded) return;
      router.push('/');
    },
    preventScrollOnSwipe: !isDescriptionExpanded,
    trackMouse: true,
    delta: 30,
  });

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentProduct && currentProduct.imageUrls.length > 1) {
      setCurrentImageIndex(prev => (prev + 1) % currentProduct.imageUrls.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentProduct && currentProduct.imageUrls.length > 1) {
      setCurrentImageIndex(prev => (prev - 1 + currentProduct.imageUrls.length) % currentProduct.imageUrls.length);
    }
  };

  if (isLoading && !currentProduct) {
    return (
      <div className="flex flex-col h-screen bg-background overflow-hidden antialiased">
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center py-2 bg-transparent">
          <Header />
        </div>
        <div className="flex-grow flex flex-col items-center justify-center pt-16 pb-28">
          <Skeleton className="w-full max-w-sm md:max-w-md aspect-[3/4] max-h-[65vh] rounded-xl shadow-2xl bg-muted" />
          <Skeleton className="w-full max-w-sm md:max-w-md h-24 mt-4 rounded-lg bg-muted" />
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/80 backdrop-blur-sm border-t border-border">
          <div className="container mx-auto max-w-md flex items-center justify-around gap-3">
            <Skeleton className="flex-1 h-14 rounded-full bg-muted" />
            <Skeleton className="flex-1 h-14 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col h-screen items-center justify-center bg-background">
        <Header />
        <p className="mt-4 text-lg text-destructive text-center px-4">{error}</p>
        <Button onClick={() => router.push('/')} className="mt-6">Back to Home</Button>
      </div>
    );
  }
  
  if (!currentProduct && !isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background">
         <Header />
        <p className="mt-4 text-lg text-muted-foreground">No products available to show!</p>
        <Button onClick={() => router.push('/checkout')} className="mt-6">Go to Pack</Button>
      </div>
    );
  }
  
  let cardAnimationClass = 'animate-fade-in';
  if (actionFeedback === 'added') {
    cardAnimationClass = 'animate-slide-out-right';
  } else if (actionFeedback === 'skipped') {
    cardAnimationClass = 'animate-slide-out-left';
  }

  const hasMultipleImages = currentProduct && currentProduct.imageUrls && currentProduct.imageUrls.length > 1;
  const isOutOfStock = currentProduct?.status === 'out-of-stock';
  
  const isValidHttpUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };
  
  const primaryImageUrl = currentProduct?.imageUrls && currentProduct.imageUrls.length > currentImageIndex && currentProduct.imageUrls[currentImageIndex]
    ? currentProduct.imageUrls[currentImageIndex]
    : 'https://placehold.co/600x400.png';
  const displayImageUrl = isValidHttpUrl(primaryImageUrl) ? primaryImageUrl : 'https://placehold.co/600x400.png';


  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden antialiased">
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center py-2 bg-transparent">
        <Header />
      </div>

      <div
        className={cn(
          "main-swipe-container flex-grow flex flex-col items-center pt-16 pb-28 relative",
          isDescriptionExpanded ? "overflow-y-auto justify-start touch-auto" : "overflow-hidden justify-center touch-pan-y"
        )}
        {...swipeHandlers}
      >
        {currentProduct && (
          <div 
            key={animationKey} 
            className={cn(
              "w-full max-w-sm md:max-w-md flex flex-col items-center", 
              cardAnimationClass,
              isDescriptionExpanded ? "pb-10" : "" 
            )}
          >
            <div 
              className="relative w-full aspect-[3/4] max-h-[65vh] bg-muted rounded-xl shadow-2xl overflow-hidden group"
              onClick={isDescriptionExpanded ? toggleDescription : undefined}
            >
              {displayImageUrl === 'https://placehold.co/600x400.png' || !isValidHttpUrl(displayImageUrl) ? (
                <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                  <ImageOff className="h-16 w-16" />
                </div>
              ) : (
                <Image
                  src={displayImageUrl}
                  alt={currentProduct.name}
                  fill
                  priority
                  className="object-cover pointer-events-none" 
                  data-ai-hint={currentProduct.dataAiHint || "product image"}
                />
              )}

              {hasMultipleImages && !isOutOfStock && (
                <>
                  <div 
                    className="absolute left-0 top-0 h-full w-1/2 z-10 cursor-pointer flex items-center"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    <div className="p-2 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                       <ChevronLeft className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div 
                    className="absolute right-0 top-0 h-full w-1/2 z-10 cursor-pointer flex items-center justify-end"
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                     <div className="p-2 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                       <ChevronRightIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                   <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                    {currentProduct.imageUrls.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={cn(
                          "h-2 w-2 rounded-full transition-all duration-300",
                          currentImageIndex === index ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                        )}
                        aria-label={`Go to image \${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {currentProduct.badge && !isOutOfStock && (
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
              {isOutOfStock && (
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Badge variant="destructive" className="text-base px-3 py-1.5 bg-red-100 text-red-700 border border-red-300 shadow-md">
                        Out of Stock
                    </Badge>
                </div>
              )}
            </div>

            <div
              className="w-full p-4 -mt-5 relative z-20 cursor-pointer"
              onClick={toggleDescription}
            >
              <div className={cn("p-4 bg-card rounded-lg shadow-lg")}>
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold text-foreground mr-2">{currentProduct.name}</h2>
                  <p className={cn("text-lg font-bold whitespace-nowrap", isOutOfStock ? "text-muted-foreground" : "text-primary")}>
                    RM {currentProduct.price.toFixed(2)}
                  </p>
                </div>
                
                <div className="mt-2 text-sm text-muted-foreground">
                  {!isDescriptionExpanded ? (
                    <p className="line-clamp-1">
                      {currentProduct.summary || (currentProduct.description && currentProduct.description.split('.')[0] + '.') || 'No summary available.'}
                    </p>
                  ) : (
                    <div
                      className="scrollable-description whitespace-pre-line text-xs leading-relaxed pt-2 max-h-[140px] overflow-y-auto p-1 border rounded-md bg-background"
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()} 
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <p>{currentProduct.description || 'No description available.'}</p>
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
            disabled={!currentProduct || actionFeedback !== null}
          >
            <X className="mr-1.5 h-5 w-5" /> Skip
          </Button>
          <Button
            size="lg"
            className={cn(
              "flex-1 h-14 rounded-full shadow-lg text-base font-medium text-accent-foreground active:scale-95",
              isOutOfStock 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : (currentProduct && isItemInTray(currentProduct.id) 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-accent hover:bg-accent/90")
            )}
            onClick={(e) => { e.stopPropagation(); if (!isOutOfStock) handleAddToPack(); }}
            disabled={!currentProduct || isOutOfStock || (currentProduct && isItemInTray(currentProduct.id)) || actionFeedback !== null}
            aria-label={
                isOutOfStock ? `${currentProduct?.name} is out of stock`
                : currentProduct && isItemInTray(currentProduct.id) ? `${currentProduct.name} is in pack` 
                : currentProduct ? `Add ${currentProduct.name} to pack` 
                : 'Add to pack'
            }
          >
            {isOutOfStock ? (
              <>
                <ShoppingBag className="mr-1.5 h-5 w-5" /> Out of Stock
              </>
            ) : currentProduct && isItemInTray(currentProduct.id) ? (
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

export default function SwipeViewPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen bg-background overflow-hidden antialiased">
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center py-2 bg-transparent">
          <Header />
        </div>
        <div className="flex-grow flex flex-col items-center justify-center pt-16 pb-28">
          <Skeleton className="w-full max-w-sm md:max-w-md aspect-[3/4] max-h-[65vh] rounded-xl shadow-2xl bg-muted" />
          <Skeleton className="w-full max-w-sm md:max-w-md h-24 mt-4 rounded-lg bg-muted" />
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/80 backdrop-blur-sm border-t border-border">
          <div className="container mx-auto max-w-md flex items-center justify-around gap-3">
            <Skeleton className="flex-1 h-14 rounded-full bg-muted" />
            <Skeleton className="flex-1 h-14 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    }>
      <SwipeViewContent />
    </Suspense>
  );
}

    