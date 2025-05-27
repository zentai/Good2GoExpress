
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { loadProductByIdFromFirestore } from '@/data/products'; // Updated import
import type { Product, OrderItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, PlusCircle, CheckCircle, ShoppingBag, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let initialTray: OrderItem[] = [];
    if (typeof window !== 'undefined') {
        const savedTray = localStorage.getItem('good2go_cart');
        if (savedTray) {
            try {
              initialTray = JSON.parse(savedTray);
              if (!Array.isArray(initialTray)) initialTray = [];
            } catch (e) {
              console.error("Failed to parse tray from localStorage on detail page", e);
              initialTray = [];
              localStorage.removeItem('good2go_cart');
            }
        }
    }
    setTrayItems(initialTray);
    
    if (productId) {
      const fetchProduct = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedProduct = await loadProductByIdFromFirestore(productId);
          setProduct(fetchedProduct);
        } catch (err) {
          console.error(`Failed to fetch product ${productId}:`, err);
          setError("Failed to load product details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    } else {
      setIsLoading(false);
      setError("Product ID is missing.");
    }
  }, [productId]);

  useEffect(() => {
    // Save trayItems to localStorage whenever it changes, but only after initial load
    // and if the trayItems array itself is not the one causing the effect (to avoid loops if not careful)
    if (!isLoading && (trayItems.length > 0 || localStorage.getItem('good2go_cart') !== JSON.stringify(trayItems))) {
         if (localStorage.getItem('good2go_cart') !== JSON.stringify(trayItems)) {
            localStorage.setItem('good2go_cart', JSON.stringify(trayItems));
        }
    }
  }, [trayItems, isLoading]);


  const isItemInTray = useCallback(
    (id: string) => trayItems.some((item) => item.productId === id),
    [trayItems]
  );

  const handleToggleTrayItem = useCallback(() => {
    if (!product) return;

    setTrayItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === product.id
      );
      let updatedItems;
      if (existingItem) {
        updatedItems = prevItems.filter(
          (item) => item.productId !== product.id
        );
      } else {
        updatedItems = [
          ...prevItems,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ];
      }
      return updatedItems;
    });
  }, [product]);


  const handleBottomBarAction = () => {
    if (!product) return;
    if (isItemInTray(product.id)) {
      router.push('/checkout');
    } else {
      handleToggleTrayItem();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} aria-label="Back to Menu" disabled>
              <ArrowLeft className="h-5 w-5 mr-1" />
            </Button>
            <Skeleton className="h-6 w-32 bg-muted" /> {/* Placeholder for title */}
            <Button variant="ghost" size="icon" aria-label="Add to list" disabled>
              <Heart className="h-6 w-6 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <main className="flex-grow container mx-auto px-0 sm:px-4">
          <Skeleton className="relative w-full aspect-[1/1] sm:aspect-square md:aspect-[3/2] max-h-[60vh] bg-muted" />
          <div className="p-4 space-y-3 border-b">
            <Skeleton className="h-8 w-3/4 bg-muted" />
            <Skeleton className="h-8 w-1/4 bg-muted" />
          </div>
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-1/3 bg-muted mb-1" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-2/3 bg-muted mt-3" />
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
          <div className="container mx-auto max-w-xl">
            <Button size="lg" className="w-full h-14" disabled>
              <Skeleton className="h-6 w-24 bg-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} aria-label="Back to Menu">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-destructive truncate flex-1 text-center px-2">
              Error
            </h1>
            <div className="w-10"></div> {/* Spacer */}
          </div>
        </div>
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Back to Menu
          </Button>
        </main>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} aria-label="Back to Menu">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-destructive truncate flex-1 text-center px-2">
              Product Not Found
            </h1>
            <div className="w-10"></div> {/* Spacer */}
          </div>
        </div>
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground mb-6">Sorry, we couldn't find the product you're looking for.</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Back to Menu
          </Button>
        </main>
      </div>
    );
  }

  const currentItemInTray = isItemInTray(product.id);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} aria-label="Back to Menu">
            <ArrowLeft className="h-5 w-5 mr-1" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground truncate flex-1 text-center px-2">
            {product.name}
          </h1>
          <Button variant="ghost" size="icon" onClick={handleToggleTrayItem} aria-label={currentItemInTray ? "Remove from list" : "Add to list"}>
            <Heart className={cn("h-6 w-6", currentItemInTray ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
          </Button>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-0 sm:px-4">
        <div className="relative w-full aspect-[1/1] sm:aspect-square md:aspect-[3/2] max-h-[60vh] bg-muted overflow-hidden">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              priority
              className="object-cover"
              data-ai-hint={product.dataAiHint || "product image"}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
              <ImageOff className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3 border-b">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
            {product.badge && (
              <Badge
                variant={
                  product.badge.type === 'hot' ? 'destructive' :
                    product.badge.type === 'new' ? 'default' :
                      product.badge.type === 'limited' ? 'secondary' :
                        product.badge.type === 'signature' ? 'default' :
                          'outline'
                }
                className={cn(
                  "text-sm px-3 py-1",
                  product.badge.type === 'hot' && "bg-red-500 text-white",
                  product.badge.type === 'new' && "bg-blue-500 text-white", 
                  product.badge.type === 'signature' && "bg-primary text-primary-foreground",
                )}
              >
                {product.badge.text}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-primary">RM {product.price.toFixed(2)}</p>
        </div>

        <div className="p-4 space-y-2">
          <h3 className="text-md font-semibold text-muted-foreground mb-1">Description</h3>
          <p className="text-sm text-foreground leading-relaxed">
            {product.description || "Delicious and freshly prepared for you."}
          </p>
          <p className="text-sm text-foreground leading-relaxed mt-3">
            <span className="font-medium">Includes:</span> {product.summary || "Details not available."}
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="container mx-auto max-w-xl">
          <Button
            onClick={handleBottomBarAction}
            size="lg"
            className={cn(
              "w-full h-14 text-lg font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-150 ease-in-out active:scale-95",
              currentItemInTray
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-accent hover:bg-accent/90 text-accent-foreground"
            )}
            disabled={!product} // Disable if product is null
          >
            {currentItemInTray ? (
              <>
                <CheckCircle className="mr-2 h-6 w-6" /> Packed | Go to Pack
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-6 w-6" /> Add to Pack | RM {product?.price.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
