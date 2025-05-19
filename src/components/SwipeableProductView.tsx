'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableProductViewProps {
  products: Product[];
}

const SwipeableProductView = ({ products }: SwipeableProductViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No products available right now.</p>;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? products.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === products.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 gap-4">
      <div className="w-full h-full flex items-center justify-center">
         <ProductCard product={products[currentIndex]} layout="swipe" />
      </div>
      <div className="flex justify-between w-full mt-4">
        <Button onClick={goToPrevious} variant="outline" size="lg" aria-label="Previous Product">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center text-sm text-muted-foreground">
          {currentIndex + 1} / {products.length}
        </div>
        <Button onClick={goToNext} variant="outline" size="lg" aria-label="Next Product">
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default SwipeableProductView;
