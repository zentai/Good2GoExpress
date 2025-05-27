import Link from 'next/link';
import { Package, Pencil } from 'lucide-react';

const Header = () => {
  return (
    <div className="w-full flex justify-center items-center relative py-1">
      <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
        <Package className="h-7 w-7" />
        <h1 className="text-xl font-semibold">Good2Go Express</h1>
      </Link>
      <Link href="/admin/add-product" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Add Product">
        <Pencil className="h-5 w-5" />
      </Link>
    </div>
  );
};

export default Header;