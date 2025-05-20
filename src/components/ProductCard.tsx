
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [clientMounted, setClientMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setClientMounted(true);
  }, []);


  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();
    setIsFavorite(!isFavorite);
    // Here you would typically update backend or local storage
  };

  const handleCardClick = () => {
    router.push(`/checkout?productId=${product.id}`);
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();
    router.push(`/checkout?productId=${product.id}`);
  };

  // Ensure client-side specific logic runs only after mount to avoid hydration issues
  if (!clientMounted) {
    // Render a placeholder or null during SSR/hydration mismatch phase
    return (
        <div className="group rounded-lg overflow-hidden shadow-md bg-card flex flex-col animate-pulse">
            <div className="aspect-square w-full bg-muted"></div>
            <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                </div>
                <div className="flex justify-end items-center mt-auto pt-2">
                    <div className="rounded-full bg-muted h-10 w-10"></div>
                </div>
            </div>
        </div>
    );
  }


  return (
    <div
      className="group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-card flex flex-col cursor-pointer h-full"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
    >
      <div className="relative">
        {/* Badge */}
        {product.badge && (
          <div
            className={cn(
              "absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-xs font-semibold shadow",
              product.badge.type === 'hot' && "bg-red-500 text-white",
              product.badge.type === 'limited' && "bg-yellow-400 text-neutral-800",
              product.badge.type === 'signature' && "bg-primary text-primary-foreground",
              product.badge.type === 'new' && "bg-blue-500 text-white",
              product.badge.type === 'custom' && "bg-muted text-muted-foreground"
            )}
          >
            {product.badge.text}
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 z-20 h-9 w-9 bg-black/30 hover:bg-black/50 text-white hover:text-red-300 rounded-full p-0 backdrop-blur-sm"
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-4 w-4 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
        </Button>

        {/* Image */}
        <div className="aspect-square w-full overflow-hidden relative z-0 bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 374px) 100vw, (max-width: 599px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
            data-ai-hint={product.dataAiHint}
            priority={product.id === '1' || product.id === '2'} // Example: prioritize first few images
          />
        </div>
        
        {/* Name and Price Overlay on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10 pointer-events-none">
          <h3 className="text-sm font-semibold text-white truncate leading-tight" title={product.name}>{product.name}</h3>
          <p className="text-xs font-bold text-primary-foreground/95">RM {product.price.toFixed(2)}</p>
        </div>
      </div>

      {/* Content below image */}
      <div className="p-2.5 flex-grow flex flex-col justify-between">
        <div>
          {/* Description (single line or omitted) */}
          <p className="text-xs text-muted-foreground truncate h-4 leading-tight">{product.description}</p>
        </div>
        
        {/* Order Button - bottom right */}
        <div className="flex justify-end items-center mt-auto pt-2"> 
          <Button
            variant="default"
            size="icon"
            className="bg-accent hover:bg-accent/80 text-accent-foreground rounded-full h-9 w-9 shadow-md hover:scale-105 transition-all duration-200 active:scale-95"
            onClick={handleOrderClick}
            aria-label={`Order ${product.name} now`}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
