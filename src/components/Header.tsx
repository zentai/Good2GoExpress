import Link from 'next/link';
import { Package } from 'lucide-react';

const Header = () => {
  return (
    // Use a simpler header structure for the swipe view if needed, or make it conditional
    // For swipe view, we want it transparent and centered.
    // For other pages, it might have shadow and different alignment.
    // This version is simplified for the swipe view's centered logo requirement.
    <div className="w-full flex justify-center"> {/* Ensure it takes width and centers content */}
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors py-1">
          <Package className="h-7 w-7" /> {/* Slightly smaller icon */}
          <h1 className="text-xl font-semibold">Good2Go Express</h1> {/* Slightly smaller text */}
        </Link>
    </div>
  );
};

export default Header;
