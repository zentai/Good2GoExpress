
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'swipe';
}

const ProductCard = ({ product, layout = 'grid' }: ProductCardProps) => {
  return (
    <Card className={`w-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${layout === 'swipe' ? 'h-[calc(100vh-200px)] max-h-[700px]' : ''}`}>
      {/* Image and Overlapping Text Section */}
      <div className="relative">
        <div className={`relative ${layout === 'swipe' ? 'flex-grow aspect-[3/2]' : 'aspect-[4/3]'} w-full`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover" // Removed rounded-t-md here as the parent Card has overflow-hidden and rounding
            data-ai-hint={product.dataAiHint}
          />
        </div>
        {/* Overlapping Name and Price */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent">
          <CardTitle className="text-xl font-semibold text-white truncate">{product.name}</CardTitle>
          <CardDescription className="text-base font-medium text-primary-foreground/90 mt-0.5">${product.price.toFixed(2)}</CardDescription>
        </div>
      </div>

      {/* Description */}
      <CardContent className="p-4 flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3">{product.description}</p>
      </CardContent>

      {/* Order Button */}
      <CardFooter className="p-4 border-t mt-auto">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/checkout?productId=${product.id}`}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Order Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
