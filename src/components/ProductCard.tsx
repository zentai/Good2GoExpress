
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'swipe'; // layout prop is optional and might not be used if swipe view is different
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [clientMounted, setClientMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    e.preventDefault();
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? `💔 Removed "${product.name}" from favorites` : `❤️ Added "${product.name}" to favorites`,
      duration: 3000,
    });
  };

  const handleCardClick = () => {
    // Navigate to product details or checkout
    router.push(`/checkout?productId=${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    e.preventDefault();
    
    // Simulate adding to cart logic
    console.log(`Added ${product.name} to cart`);

    // Show toast notification
    const { dismiss } = toast({
      title: `✅ 已加入「${product.name}」x1`,
      duration: 5000, // Toast disappears after 5 seconds
    });

    // Optionally, provide some visual feedback on the button itself
    // e.g., brief change of icon or subtle animation if desired
  };

  if (!clientMounted) {
    // Updated skeleton to reflect new structure and target height
    return (
      <div className="group rounded-lg overflow-hidden shadow-md bg-card animate-pulse w-full h-[244px] flex flex-col">
        <div className="h-44 bg-muted rounded-t-lg"></div> {/* Image placeholder */}
        <div className="p-3 space-y-2 flex-grow">
          <div className="h-4 bg-muted rounded w-3/4"></div> {/* Name placeholder */}
          <div className="h-4 bg-muted rounded w-1/2"></div> {/* Price placeholder */}
        </div>
      </div>
    );
  }

  return (
    <div
      className="group rounded-lg overflow-hidden shadow-md hover:shadow-xl active:shadow-lg active:bg-secondary/30 transition-all duration-300 bg-card flex flex-col cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
      aria-label={`View details for ${product.name}`}
      style={{ height: '298px' }} // Enforce total card height
    >
      {/* Image container with fixed height */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted h-44"> 
        {product.badge && (
          <div
            className={cn(
              "absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-xs font-semibold shadow-md",
              product.badge.type === 'hot' && "bg-red-500 text-white",
              product.badge.type === 'limited' && "bg-yellow-500 text-neutral-800",
              product.badge.type === 'signature' && "bg-primary text-primary-foreground",
              product.badge.type === 'new' && "bg-blue-500 text-white",
              product.badge.type === 'custom' && "bg-slate-600 text-white" // Example for custom
            )}
          >
            {product.badge.text}
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-20 h-9 w-9 bg-black/20 hover:bg-black/40 text-white hover:text-red-400 rounded-full p-0 backdrop-blur-sm transition-all active:scale-90"
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
        >
          <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
        </Button>

        <Image
          src={product.imageUrl}
          alt={product.name}
          fill // Fill the 176px height container, aspect ratio maintained by parent
          sizes="(max-width: 374px) 100vw, (max-width: 599px) 50vw, 33vw" // Adjusted sizes
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
          data-ai-hint={product.dataAiHint}
          priority={product.id === '1' || product.id === '2'} // Prioritize loading for first few images
        />
        
        {/* Add to Cart Button - Floats over image bottom-right */}
        <Button
            variant="default" // Default variant uses primary color, can be changed to accent
            size="icon"
            className="absolute bottom-3 right-3 z-20 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-10 w-10 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Name and Price section below the image */}
      <div className="p-3 flex-grow flex flex-col justify-center"> {/* Use p-3 for spacing, flex-grow allows this section to take remaining space */}
        <h3 className="text-sm font-semibold text-foreground truncate leading-tight" title={product.name}>{product.name}</h3>
        <p className="text-base font-bold text-primary mt-1">RM {product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
