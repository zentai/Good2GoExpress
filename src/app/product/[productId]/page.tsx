
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { mockProducts } from '@/data/products';
import type { Product, OrderItem } from '@/lib/types';
import Header from '@/components/Header'; // Using existing Header for consistency for now
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, PlusCircle, CheckCircle, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial tray items from localStorage
  useEffect(() => {
    const savedTray = localStorage.getItem('good2go_cart');
    if (savedTray) {
      try {
        setTrayItems(JSON.parse(savedTray));
      } catch (e) {
        console.error("Failed to parse tray from localStorage", e);
        setTrayItems([]);
      }
    }
  }, []);

  // Find product by ID
  useEffect(() => {
    if (productId) {
      const foundProduct = mockProducts.find((p) => p.id === productId);
      setProduct(foundProduct || null);
    }
    setIsLoading(false);
  }, [productId]);

  // Persist tray items to localStorage
  useEffect(() => {
    // Only save if trayItems has been initialized (not in its initial empty array state from useState)
    // This prevents overwriting localStorage with an empty array on initial load before it's populated.
    if (trayItems.length > 0 || localStorage.getItem('good2go_cart')) {
        localStorage.setItem('good2go_cart', JSON.stringify(trayItems));
    }
  }, [trayItems]);


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
        toast({
          title: `❌ Removed "${product.name}" from your list`,
          duration: 3000,
        });
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
        toast({
          title: `✅ Added "${product.name}" to your list!`,
          description: "You can adjust quantity in your pack.",
          duration: 3000,
        });
      }
      return updatedItems;
    });
  }, [product, toast]);


  const handleBottomBarAction = () => {
    if (!product) return;
    if (isItemInTray(product.id)) {
      router.push('/checkout'); // Navigate to Packing Page
    } else {
      handleToggleTrayItem(); // Add to pack
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
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
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-semibold text-destructive mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">Sorry, we couldn't find the product you're looking for.</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </main>
      </div>
    );
  }

  const currentItemInTray = isItemInTray(product.id);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24"> {/* Padding bottom for fixed bar */}
      {/* Simplified Top Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="h-6 w-6" />
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
        {/* Product Image -占整頁 60% 高度 is a bit tricky without JS for viewport height. Using aspect ratio. */}
        <div className="relative w-full aspect-[3/2] sm:aspect-video md:aspect-[16/9] max-h-[60vh] bg-muted overflow-hidden">
          {/* Placeholder for image carousel - showing first image */}
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            className="object-cover"
            data-ai-hint={product.dataAiHint || "product image"}
          />
          {/* Add carousel dots here if implementing */}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
            {product.badge && (
              <Badge
                variant={
                  product.badge.type === 'hot' ? 'destructive' :
                  product.badge.type === 'new' ? 'default' : // 'default' is often primary
                  product.badge.type === 'limited' ? 'secondary' : // Using secondary for limited
                  'outline' // Fallback
                }
                className={cn(
                  "text-sm px-3 py-1",
                  product.badge.type === 'hot' && "bg-red-500 text-white",
                  product.badge.type === 'new' && "bg-blue-500 text-white",
                  product.badge.type === 'signature' && "bg-primary text-primary-foreground",
                  // ensure custom and limited have distinct styles if needed
                )}
              >
                {product.badge.text}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-primary">RM {product.price.toFixed(2)}</p>
        </div>

        {/* Product Description */}
        <div className="p-4 space-y-2 border-t">
          <h3 className="text-md font-semibold text-muted-foreground">Description</h3>
          <p className="text-sm text-foreground leading-relaxed">
            {product.description || "Delicious and freshly prepared for you."}
          </p>
          {/* Detailed list - example, can be driven by product data */}
          <p className="text-sm text-foreground leading-relaxed mt-2">
            Includes: 🥬 Fresh Greens, 🍅 Ripe Tomatoes, 🌾 Quality Grains... and a touch of love!
          </p>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="container mx-auto max-w-xl">
          <Button
            onClick={handleBottomBarAction}
            size="lg"
            className={cn(
              "w-full h-14 text-lg font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-150 ease-in-out active:scale-95",
              currentItemInTray
                ? "bg-green-600 hover:bg-green-700 text-white" // Style for "Packed"
                : "bg-accent hover:bg-accent/90 text-accent-foreground" // Style for "Add to Pack"
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
