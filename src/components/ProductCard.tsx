
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types'; // Removed OrderItem as it's not used here
import { Button } from '@/components/ui/button';
import { Heart, ImageOff } from 'lucide-react'; // Added ImageOff
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onToggleItemInList: (product: Product) => void;
  isInList: boolean;
}

const ProductCard = ({ product, onToggleItemInList, isInList }: ProductCardProps) => {
  const [clientMounted, setClientMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const isOutOfStock = product.status === "out-of-stock";

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on the toggle button or if out of stock and card click is not desired
    if ((e.target as HTMLElement).closest('button[aria-label*="list"]') || isOutOfStock) {
        if (isOutOfStock && !(e.target as HTMLElement).closest('button[aria-label*="list"]')) {
            // If out of stock and clicked anywhere else on card, maybe do nothing or show a quick message
            // For now, we'll allow navigation to swipe view even if out of stock to see details
            router.push(`/swipe-view?productId=${product.id}`);
            return;
        }
      return;
    }
    router.push(`/swipe-view?productId=${product.id}`);
  };

  const handleToggleListClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock) return; // Prevent action if out of stock
    onToggleItemInList(product);
  };

  if (!clientMounted && !product) { // Added !product check for initial render safety
    // Skeleton Loader
    return (
      <div
        className="group rounded-lg overflow-hidden shadow-md bg-card animate-pulse flex flex-col"
        style={{ height: '244px' }}
      >
        <div className="h-44 bg-muted rounded-t-lg"></div>
        <div className="p-3 space-y-2 flex-grow flex flex-col justify-center">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  // Fallback for primaryImageUrl
  const primaryImageUrl = product.imageUrls && product.imageUrls.length > 0 && product.imageUrls[0]
    ? product.imageUrls[0]
    : 'https://placehold.co/600x400.png';
  
  const isValidHttpUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };
  const displayImageUrl = isValidHttpUrl(primaryImageUrl) ? primaryImageUrl : 'https://placehold.co/600x400.png';


  return (
    <div
      className={cn(
        "group rounded-lg overflow-hidden shadow-md hover:shadow-xl active:shadow-lg active:bg-secondary/30 transition-all duration-300 bg-card flex flex-col",
        isOutOfStock ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={isOutOfStock ? -1 : 0}
      onKeyDown={(e) => !isOutOfStock && (e.key === 'Enter' || e.key === ' ') && handleCardClick(e as any)}
      aria-label={`View details for ${product.name}${isOutOfStock ? ' (Out of Stock)' : ''}`}
      style={{ height: '244px' }}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted h-44">
        {product.badge && !isOutOfStock && ( // Only show product badge if not out of stock, or style differently
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

        {isOutOfStock && (
          <div className="absolute top-2 left-2 z-30 bg-red-100 text-red-700 border border-red-300 text-xs font-semibold px-2 py-1 rounded-md shadow-md">
            Out of Stock
          </div>
        )}

        <Button
          variant="default"
          size="icon"
          className={cn(
            "absolute bottom-3 right-3 z-20 rounded-full h-10 w-10 shadow-lg transition-all duration-200",
            isInList && !isOutOfStock ? "bg-red-500 hover:bg-red-600 text-white" : "bg-accent hover:bg-accent/90 text-accent-foreground",
            isOutOfStock ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted" : "hover:scale-110 active:scale-95"
          )}
          onClick={handleToggleListClick}
          aria-label={
            isOutOfStock ? `${product.name} is out of stock` : 
            isInList ? `Remove ${product.name} from your list` : 
            `Add ${product.name} to your list`
          }
          disabled={isOutOfStock}
        >
          <Heart className={cn("h-5 w-5", isInList && !isOutOfStock ? "fill-white" : "fill-transparent", isOutOfStock ? "text-muted-foreground" : "")} />
        </Button>
        
        {displayImageUrl === 'https://placehold.co/600x400.png' || !isValidHttpUrl(displayImageUrl) ? (
            <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground">
                <ImageOff className="h-16 w-16" />
            </div>
        ) : (
            <Image
                src={displayImageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 374px) 100vw, (max-width: 599px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                data-ai-hint={product.dataAiHint || product.name.split(" ").slice(0, 2).join(" ")}
                priority={product.id === 'sa1' || product.id === 'tq1'} 
            />
        )}
      </div>

      <div className="p-3 flex-grow flex flex-col justify-center">
        <h3 className="text-sm font-semibold text-foreground truncate leading-tight" title={product.name}>{product.name}</h3>
        <p className="text-base font-bold text-primary mt-1">RM {product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
