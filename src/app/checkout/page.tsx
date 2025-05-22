
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderItem } from '@/lib/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Package, Home as HomeIcon, ShoppingBag, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Define WhatsApp number here or import from a config file
const WHATSAPP_PHONE_NUMBER = '+60187693136'; // Example: Malaysian number. Replace with actual.

interface CartItemDisplayProps {
  item: OrderItem;
}

function CartItemDisplay({ item }: CartItemDisplayProps) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
      <div>
        <p className="font-medium text-foreground">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.quantity} &times; RM {item.price.toFixed(2)}
        </p>
      </div>
      <p className="font-semibold text-foreground">RM {(item.quantity * item.price).toFixed(2)}</p>
    </div>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPickupTime, setSelectedPickupTime] = useState<string>('');
  const [unitNumber, setUnitNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('good2go_cart');
      if (savedCart) {
        try {
          const parsedCart: OrderItem[] = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            setCartItems(parsedCart);
            const total = parsedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            setTotalAmount(total);
          } else {
            // Cart is empty or malformed
            setCartItems([]);
            setTotalAmount(0);
            toast({
              title: "购物车是空的",
              description: "请先添加商品再进行结账。",
              variant: "destructive",
              duration: 4000,
            });
            router.push('/'); // Redirect to home if cart is empty on checkout load
          }
        } catch (error) {
          console.error("Failed to parse cart from localStorage on checkout:", error);
          setCartItems([]);
          setTotalAmount(0);
          localStorage.removeItem('good2go_cart'); // Clear corrupted data
          toast({
            title: "购物车加载失败",
            description: "无法加载您的购物车，请重试。",
            variant: "destructive",
            duration: 4000,
          });
          router.push('/');
        }
      } else {
        // No cart in localStorage
        setCartItems([]);
        setTotalAmount(0);
        toast({
          title: "购物车是空的",
          description: "看起来您还没有添加任何商品。",
          variant: "destructive",
          duration: 4000,
        });
        router.push('/');
      }
      setIsLoading(false);
    }
  }, [router, toast]);

  const pickupTimes = ["12:00 – 13:00", "18:00 – 19:00"];

  const handlePlaceOrder = () => {
    if (!selectedPickupTime) {
      toast({ title: "提示", description: "请选择一个取货时间段。", variant: "destructive" });
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: "购物车为空", description: "请先添加商品。", variant: "destructive" });
      router.push('/');
      return;
    }

    setIsSubmitting(true);

    let orderDetails = "Hi Good2Go Express, 我想下单:\n\n";
    cartItems.forEach(item => {
      orderDetails += `📦 ${item.name}\n`;
      orderDetails += `   数量: ${item.quantity}\n`;
      orderDetails += `   单价: RM ${item.price.toFixed(2)}\n\n`;
    });
    orderDetails += `📝 总金额: RM ${totalAmount.toFixed(2)}\n`;
    orderDetails += `🕒 取货时间: ${selectedPickupTime}\n`;
    if (unitNumber.trim()) {
      orderDetails += `🏠 门牌号: ${unitNumber.trim()}\n`;
    }
    orderDetails += "\n谢谢！";

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(orderDetails)}`;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('good2go_cart'); // Clear cart from localStorage
    }
    
    // Redirect to WhatsApp
    window.location.href = whatsappUrl;
    
    // Potentially show a "Redirecting to WhatsApp..." message or toast
    // For now, direct redirect is fine. User might not return to this page.
    // setIsSubmitting(false); // Not strictly necessary due to redirect
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <ShoppingBag className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 mt-4 text-lg text-muted-foreground">加载您的购物车...</p>
      </div>
    );
  }

  // Note: The useEffect already redirects if cart is empty after loading, so this state might not be hit often.
  // However, it's a good fallback.
  if (!isLoading && cartItems.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl text-center py-10">
        <CardHeader>
            <ShoppingBag className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-semibold text-destructive">您的购物车是空的</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">请先去添加一些商品吧！</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => router.push('/')} className="mt-6">
                <HomeIcon className="mr-2 h-5 w-5" /> 返回首页
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl rounded-xl">
      <CardHeader className="text-center border-b pb-4">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
            <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">确认订单详情</CardTitle>
        <CardDescription className="text-muted-foreground">请检查您的商品并选择取货信息。</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Item List */}
        <div className="space-y-1 bg-secondary/30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">您的商品</h3>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            {cartItems.map(item => (
              <CartItemDisplay key={item.productId} item={item} />
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between items-center pt-2">
            <p className="text-lg font-semibold text-foreground">订单总计:</p>
            <p className="text-2xl font-bold text-accent">RM {totalAmount.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Pickup Time */}
        <div className="space-y-3 pt-2">
          <Label className="text-md font-semibold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />选择取货时间段
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pickupTimes.map(time => (
              <Button
                key={time}
                variant={selectedPickupTime === time ? 'default' : 'outline'}
                onClick={() => setSelectedPickupTime(time)}
                className={cn(
                  "py-3 text-base h-auto w-full justify-center rounded-md border-2 font-medium",
                  selectedPickupTime === time 
                    ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2 shadow-lg" 
                    : "bg-background text-foreground border-input hover:bg-secondary/50"
                )}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
          
        {/* Unit Number */}
        <div className="space-y-2 pt-2">
          <Label htmlFor="unitNumber" className="text-md font-semibold flex items-center gap-2 text-foreground">
            <HomeIcon className="h-5 w-5 text-primary" /> 门牌号（可选）
          </Label>
          <Input
            id="unitNumber"
            type="text"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder="例如：A-12-3 或 Lot 123"
            className="h-12 text-base rounded-md border-input focus:border-primary focus:ring-primary"
          />
        </div>
        
        {/* WhatsApp Disclaimer */}
        <p className="text-xs sm:text-sm text-muted-foreground text-center pt-3 px-2 border-t mt-4">
          👉 确认后将跳转 WhatsApp，向店家发送预编辑好的订单信息。
        </p>

      </CardContent>
      <CardFooter className="p-4 sm:p-6 border-t">
        <Button
          onClick={handlePlaceOrder}
          disabled={isSubmitting || cartItems.length === 0 || !selectedPickupTime}
          className="w-full h-14 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-md flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <ShoppingBag className="mr-2 h-5 w-5 animate-spin" /> 正在跳转...
            </>
          ) : (
            <>
              <Package className="mr-2 h-5 w-5" /> 确认并发送订单 (RM {totalAmount.toFixed(2)})
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8"> {/* Allow natural scrolling */}
        <Suspense fallback={
          <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
            <ShoppingBag className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 mt-4 text-xl text-muted-foreground">正在准备结账页面...</p>
          </div>
        }>
          <CheckoutPageContent />
        </Suspense>
      </main>
    </div>
  );
}
