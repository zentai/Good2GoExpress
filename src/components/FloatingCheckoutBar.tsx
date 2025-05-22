
'use client';

import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import type { OrderItem } from '@/lib/types'; // Import OrderItem

interface FloatingCheckoutBarProps {
  cartItems: OrderItem[]; // Accept cartItems as a prop
}

export default function FloatingCheckoutBar({ cartItems }: FloatingCheckoutBarProps) {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasItems = itemCount > 0;

  // Determine the href for the checkout link
  // If there are items, link to checkout with the first item's ID
  // Otherwise, the link is nominal as the onClick handler will prevent navigation.
  const checkoutHref = hasItems ? `/checkout?productId=${cartItems[0].productId}` : '/checkout';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <div className="text-sm">
          {hasItems ? (
            <>
              <p className="font-semibold text-foreground">
                已加购 {itemCount} {itemCount === 1 ? '项' : '项'}
              </p>
              <p className="text-lg font-bold text-primary">
                共: RM {totalAmount.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground italic">您的购物车是空的，快去添加商品吧！</p>
          )}
        </div>
        <Link href={checkoutHref} passHref legacyBehavior>
          <a
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium shadow-md transition-all
                        ${hasItems
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95'
                          : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'}`}
            aria-disabled={!hasItems}
            onClick={(e) => {
              if (!hasItems) {
                e.preventDefault();
                alert("您的购物车是空的，请先添加商品！"); // Simple alert for now
              }
              // If hasItems, link will proceed.
            }}
            title={hasItems ? "去结账" : "请先添加商品至购物车"}
          >
            {hasItems ? '去结账' : '购物车为空'}
            {hasItems && <ArrowRight className="h-5 w-5" />}
            {!hasItems && <Package className="h-5 w-5" />}
          </a>
        </Link>
      </div>
    </div>
  );
}
