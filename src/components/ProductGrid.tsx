
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void; // Add this prop
}

const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No products available right now.</p>;
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 smd:grid-cols-3 gap-3 xs:gap-4 p-2 xs:p-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} /> // Pass it down
      ))}
    </div>
  );
};

export default ProductGrid;
