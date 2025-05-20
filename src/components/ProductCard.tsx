
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface ProductCardProps {
  product: Product;
  // Removed layout prop as the new design is more unified
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [clientMounted, setClientMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();
    setIsFavorite(!isFavorite);
    // Add to favorites logic (e.g., API call, local storage)
    toast({
      title: isFavorite ? `💔 Removed "${product.name}" from favorites` : `❤️ Added "${product.name}" to favorites`,
      duration: 3000, // Short duration for favorite toggle
    });
  };

  const handleCardClick = () => {
    // Navigate to product details or checkout page
    router.push(`/checkout?productId=${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // IMPORTANT: Prevent card click event
    e.preventDefault();
    
    // Simulate adding to cart logic
    console.log(`Added ${product.name} to cart`);

    // Show toast notification
    const { dismiss } = toast({
      title: `✅ 已加入「${product.name}」x1`,
      // No description needed as per new requirement
    });

    // Dismiss toast after 5 seconds
    setTimeout(() => {
      dismiss();
    }, 5000);
  };

  // Skeleton loader for when component is not yet mounted on client
  if (!clientMounted) {
    return (
      <div className="group rounded-lg overflow-hidden shadow-md bg-card flex flex-col animate-pulse aspect-square">
        <div className="w-full h-full bg-muted"></div>
        {/* Simplified skeleton for the new layout */}
      </div>
    );
  }

  return (
    <div
      className="group rounded-lg overflow-hidden shadow-md hover:shadow-xl active:shadow-lg active:bg-secondary/30 transition-all duration-300 bg-card flex flex-col cursor-pointer h-full"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
      aria-label={`View details for ${product.name}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {/* Badge */}
        {product.badge && (
          <div
            className={cn(
              "absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-xs font-semibold shadow-md", // Enhanced shadow for badge
              product.badge.type === 'hot' && "bg-red-500 text-white",
              product.badge.type === 'limited' && "bg-yellow-500 text-neutral-800", // Darker yellow
              product.badge.type === 'signature' && "bg-primary text-primary-foreground",
              product.badge.type === 'new' && "bg-blue-500 text-white",
              product.badge.type === 'custom' && "bg-slate-600 text-white" // Custom badge style example
            )}
          >
            {product.badge.text}
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-20 h-9 w-9 bg-black/20 hover:bg-black/40 text-white hover:text-red-400 rounded-full p-0 backdrop-blur-sm transition-all active:scale-90"
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
        >
          <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
        </Button>

        {/* Image */}
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 374px) 100vw, (max-width: 599px) 50vw, 33vw" // Keep existing sizes, aspect ratio handles the rest
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
          data-ai-hint={product.dataAiHint}
          priority={product.id === '1' || product.id === '2'} 
        />
        
        {/* Name and Price Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/50 to-transparent z-10 pointer-events-none">
          <h3 className="text-base font-bold text-white truncate leading-tight" title={product.name}>{product.name}</h3>
          <p className="text-sm font-semibold text-primary-foreground/90">RM {product.price.toFixed(2)}</p>
        </div>

        {/* Add to Cart Button - Floated on Image */}
        <Button
            variant="default"
            size="icon"
            className="absolute bottom-3 right-3 z-20 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-10 w-10 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Content area below image is now removed to make image larger */}
      {/* No description text, no separate button area below image */}
    </div>
  );
};

export default ProductCard;
