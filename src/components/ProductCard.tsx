
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
  layout?: 'grid' | 'swipe';
  onAddToCart: (product: Product) => void; // Add this prop
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [clientMounted, setClientMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? `💔 Removed "${product.name}" from favorites` : `❤️ Added "${product.name}" to favorites`,
      duration: 3000,
    });
  };

  const handleCardClick = () => {
    router.push(`/checkout?productId=${product.id}`);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    onAddToCart(product); // Call the passed-in function

    toast({ // Keep the toast for immediate user feedback
      title: `✅ 已加入「${product.name}」x1`,
      duration: 5000,
    });
  };

  if (!clientMounted) {
    return (
      <div 
        className="group rounded-lg overflow-hidden shadow-md bg-card animate-pulse flex flex-col"
        style={{ height: '244px' }} // Match the final card height
      >
        <div className="h-44 bg-muted rounded-t-lg"></div> {/* Image placeholder */}
        <div className="p-3 space-y-2 flex-grow flex flex-col justify-center">
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
      style={{ height: '244px' }} 
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted h-44"> 
        {product.badge && (
          <div
            className={cn(
              "absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-xs font-semibold shadow-md",
              product.badge.type === 'hot' && "bg-red-500 text-white",
              product.badge.type === 'limited' && "bg-yellow-500 text-neutral-800",
              product.badge.type === 'signature' && "bg-primary text-primary-foreground",
              product.badge.type === 'new' && "bg-blue-500 text-white",
              product.badge.type === 'custom' && "bg-slate-600 text-white"
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
          fill
          sizes="(max-width: 374px) 100vw, (max-width: 599px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
          data-ai-hint={product.dataAiHint}
          priority={product.id === '1' || product.id === '2'}
        />
        
        <Button
            variant="default"
            size="icon"
            className="absolute bottom-3 right-3 z-20 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-10 w-10 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
            onClick={handleAddToCartClick} // Updated handler
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-3 flex-grow flex flex-col justify-center">
        <h3 className="text-sm font-semibold text-foreground truncate leading-tight" title={product.name}>{product.name}</h3>
        <p className="text-base font-bold text-primary mt-1">RM {product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
