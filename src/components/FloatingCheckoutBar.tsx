
'use client';

import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';

export default function FloatingCheckoutBar() {
  // Placeholder values - these would come from a cart state management solution
  const itemCount = 0; // Example: 3
  const totalAmount = 0.00; // Example: 24.00

  // Determine button/text based on cart state (simplified for now)
  const hasItems = itemCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <div className="text-sm">
          {hasItems ? (
            <>
              <p className="font-semibold text-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
              </p>
              <p className="text-lg font-bold text-primary">
                Total: RM {totalAmount.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground italic">Your cart is empty. Add some items!</p>
          )}
        </div>
        <Link href="/checkout" passHref legacyBehavior>
          <a
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium shadow-md transition-all
                        ${hasItems 
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95' 
                          : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'}`}
            aria-disabled={!hasItems}
            onClick={(e) => {
              if (!hasItems) {
                e.preventDefault();
                // Optionally, show a toast here: "Please add items to your cart first."
                alert("Please add items to your cart first."); // Simple alert for now
              }
            }}
            title={hasItems ? "Go to Checkout" : "Add items to cart to proceed"}
          >
            {hasItems ? 'Checkout' : 'Cart Empty'}
            {hasItems && <ArrowRight className="h-5 w-5" />}
            {!hasItems && <Package className="h-5 w-5" />}
          </a>
        </Link>
      </div>
    </div>
  );
}
