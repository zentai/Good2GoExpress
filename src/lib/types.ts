
export interface ProductBadge {
  text: string;
  type: 'hot' | 'limited' | 'signature' | 'new' | 'custom'; // Added 'custom' for flexibility
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  dataAiHint: string;
  badge?: ProductBadge; // Optional badge
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  items: OrderItem[];
  pickupTime: string;
  totalPrice: number;
}
