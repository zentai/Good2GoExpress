
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product, OrderItem } from '@/lib/types'; // Assuming OrderItem might be relevant if card shows quantity, but here it's just isInList
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
// Removed: import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onToggleItemInList: (product: Product) => void;
  isInList: boolean;
}

const ProductCard = ({ product, onToggleItemInList, isInList }: ProductCardProps) => {
  const [clientMounted, setClientMounted] = useState(false);
  const router = useRouter();
  // Removed: const { toast } = useToast();

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if the click was on the heart button
    if ((e.target as HTMLElement).closest('button[aria-label*="list"]')) {
      return;
    }
    router.push(`/swipe-view?productId=${product.id}`);
  };

  const handleToggleListClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleItemInList(product);
    // Removed toast notifications
  };

  if (!clientMounted) {
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
          variant="default"
          size="icon"
          className={cn(
            "absolute bottom-3 right-3 z-20 rounded-full h-10 w-10 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200",
            isInList ? "bg-red-500 hover:bg-red-600 text-white" : "bg-accent hover:bg-accent/90 text-accent-foreground"
          )}
          onClick={handleToggleListClick}
          aria-label={isInList ? `Remove ${product.name} from your list` : `Add ${product.name} to your list`}
        >
          <Heart className={cn("h-5 w-5", isInList ? "fill-white" : "fill-transparent")} />
        </Button>

        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 374px) 100vw, (max-width: 599px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
          data-ai-hint={product.dataAiHint || product.name.split(" ").slice(0, 2).join(" ")}
          priority={product.id === '1' || product.id === '2'}
        />
      </div>

      <div className="p-3 flex-grow flex flex-col justify-center">
        <h3 className="text-sm font-semibold text-foreground truncate leading-tight" title={product.name}>{product.name}</h3>
        <p className="text-base font-bold text-primary mt-1">RM {product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
