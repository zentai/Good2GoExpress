import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'swipe';
}

const ProductCard = ({ product, layout = 'grid' }: ProductCardProps) => {
  return (
    <Card className={`w-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ${layout === 'swipe' ? 'h-[calc(100vh-200px)] max-h-[700px]' : ''}`}>
      <CardHeader className="p-4">
        <CardTitle className="text-xl font-semibold text-foreground truncate">{product.name}</CardTitle>
        <CardDescription className="text-primary font-medium">${product.price.toFixed(2)}</CardDescription>
      </CardHeader>
      <div className={`relative ${layout === 'swipe' ? 'flex-grow aspect-[3/2]' : 'aspect-[4/3]'} w-full`}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-t-md"
          data-ai-hint={product.dataAiHint}
        />
      </div>
      <CardContent className="p-4 flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3">{product.description}</p>
      </CardContent>
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
