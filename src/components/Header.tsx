import Link from 'next/link';
import { Package } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-background shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Package className="h-8 w-8" />
          <h1 className="text-2xl font-semibold">Good2Go Express</h1>
        </Link>
        {/* Navigation items can be added here if needed */}
      </div>
    </header>
  );
};

export default Header;
