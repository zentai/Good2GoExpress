
'use client';

import Link from 'next/link';
import { Package, ArrowRight, RefreshCw } from 'lucide-react';
import type { OrderItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingCheckoutBarProps {
  trayItems: OrderItem[];
  onClearTray: () => void;
}

export default function FloatingCheckoutBar({ trayItems, onClearTray }: FloatingCheckoutBarProps) {
  const itemCount = trayItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = trayItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasItems = itemCount > 0;

  const checkoutHref = '/checkout';

  const handlePackingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasItems) {
      e.preventDefault();
      // Consider a more subtle feedback or rely on button's disabled state
      // For now, alert is a clear indicator.
      alert("Your list is empty. Please select some items first!");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg print:hidden">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <div className="text-sm flex-shrink-0 pr-2"> {/* Added flex-shrink-0 and pr-2 for spacing */}
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
        <div className="flex items-stretch gap-2 flex-grow justify-end"> {/* Wrapper for buttons, takes remaining space */}
          {hasItems && (
            <Button
              variant="outline"
              onClick={onClearTray}
              aria-label="Clear packing list"
              className="p-0 w-12 flex items-center justify-center rounded-lg shadow-sm text-muted-foreground hover:bg-secondary/50"
              // Ensure height matches the other button if they are different by default
              // The items-stretch on parent div helps
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          )}
          <Link href={checkoutHref} passHref legacyBehavior>
            <a
              className={cn(
                `flex flex-1 items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium shadow-md transition-all min-w-[180px] max-w-[300px]`, // Added min-w and max-w for control
                hasItems
                  ? 'bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
              )}
              aria-disabled={!hasItems}
              onClick={handlePackingClick}
              title={hasItems ? "Proceed to packing" : "Please add items to your list first"}
            >
              <Package className="h-5 w-5" />
              {hasItems ? 'Start Packing' : 'List is Empty'}
              {hasItems && <ArrowRight className="h-5 w-5" />}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
