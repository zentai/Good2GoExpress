
import type { Product, OrderItem } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onToggleItemInList: (product: Product) => void; // Renamed from onAddToCart
  trayItems: OrderItem[]; // Added to pass down for isInList check
}

const ProductGrid = ({ products, onToggleItemInList, trayItems }: ProductGridProps) => {
  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No products available right now.</p>;
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 smd:grid-cols-3 gap-3 xs:gap-4 p-2 xs:p-4">
      {products.map((product) => {
        const isInList = trayItems.some(item => item.productId === product.id);
        return (
          <ProductCard 
            key={product.id} 
            product={product} 
            onToggleItemInList={onToggleItemInList}
            isInList={isInList}
          />
        );
      })}
    </div>
  );
};

export default ProductGrid;
