
'use client';

import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react'; // Package icon still fits "Packing"
import type { OrderItem } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface FloatingCheckoutBarProps {
  trayItems: OrderItem[]; // Renamed from cartItems
}

export default function FloatingCheckoutBar({ trayItems }: FloatingCheckoutBarProps) {
  const router = useRouter();
  const itemCount = trayItems.reduce((sum, item) => sum + item.quantity, 0); // Assuming quantity is always 1 for this new logic
  const totalAmount = trayItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasItems = itemCount > 0;

  const checkoutHref = '/checkout'; // This page will be "Packing List"

  const handlePackingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasItems) {
      e.preventDefault(); 
      alert("Your list is empty. Please select some items first!"); 
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <div className="text-sm">
          {hasItems ? (
            <>
              <p className="font-semibold text-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your list
              </p>
              <p className="text-lg font-bold text-primary">
                Total: RM {totalAmount.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground italic">Your list is empty. Let's pick some items!</p>
          )}
        </div>
        <Link href={checkoutHref} passHref legacyBehavior>
          <a
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium shadow-md transition-all
                        ${hasItems
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95'
                          : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'}`}
            aria-disabled={!hasItems}
            onClick={handlePackingClick}
            title={hasItems ? "Proceed to packing" : "Please add items to your list first"}
          >
            <Package className="h-5 w-5" /> {/* Package icon is suitable for "Packing" */}
            {hasItems ? 'Start Packing' : 'List is Empty'}
            {hasItems && <ArrowRight className="h-5 w-5" />}
          </a>
        </Link>
      </div>
    </div>
  );
}
