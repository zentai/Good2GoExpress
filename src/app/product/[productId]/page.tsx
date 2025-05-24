
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { mockProducts } from '@/data/products';
import type { Product, OrderItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, PlusCircle, CheckCircle, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
// Removed useToast import as it's no longer used for add/remove feedback here
// import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const { toast } = useToast(); // Toasts removed for add/remove actions

  useEffect(() => {
    setIsLoading(true);
    let initialTray: OrderItem[] = [];
    if (typeof window !== 'undefined') {
        const savedTray = localStorage.getItem('good2go_cart');
        if (savedTray) {
            try {
            initialTray = JSON.parse(savedTray);
            } catch (e) {
            console.error("Failed to parse tray from localStorage on detail page", e);
            initialTray = [];
            }
        }
    }
    setTrayItems(initialTray);
    
    if (productId) {
      const foundProduct = mockProducts.find((p) => p.id === productId);
      setProduct(foundProduct || null);
    }
    setIsLoading(false);
  }, [productId]);

  useEffect(() => {
    if (!isLoading && (trayItems.length > 0 || localStorage.getItem('good2go_cart') !== null)) {
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
        // Toast removed: toast({ title: "❌ Removed from list", description: `${product.name} removed.` });
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
        // Toast removed: toast({ title: "✅ Added to list", description: `${product.name} added.` });
      }
      return updatedItems;
    });
  }, [product]);


  const handleBottomBarAction = () => {
    if (!product) return;
    if (isItemInTray(product.id)) {
      router.push('/checkout'); // Navigate to Packing Page
    } else {
      handleToggleTrayItem(); // Add to pack and stay on page
    }
  };

  if (isLoading && !product) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between h-[57px]">
            <ShoppingBag className="h-8 w-8 animate-pulse text-primary" />
          </div>
        </div>
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <ShoppingBag className="h-16 w-16 animate-spin text-primary" />
          <p className="ml-4 text-xl text-muted-foreground">Loading Product...</p>
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
    <div className="flex flex-col min-h-screen bg-background pb-24"> {/* Padding bottom for fixed bar */}
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
              src={product.imageUrls[0]} // Display the first image
              alt={product.name}
              fill
              priority
              className="object-cover"
              data-ai-hint={product.dataAiHint || "product image"}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">No Image Available</div>
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
            <span className="font-medium">Includes:</span> {product.summary || "🥬 Fresh Greens, 🍅 Ripe Tomatoes, 🌾 Quality Grains... and a touch of love!"}
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
                ? "bg-green-600 hover:bg-green-700 text-white" // Was previously using accent, changed for clarity
                : "bg-accent hover:bg-accent/90 text-accent-foreground"
            )}
          >
            {currentItemInTray ? (
              <>
                <CheckCircle className="mr-2 h-6 w-6" /> Packed | Go to Pack
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-6 w-6" /> Add to Pack | RM {product.price.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
