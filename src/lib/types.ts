
export interface ProductBadge {
  text: string;
  type: 'hot' | 'limited' | 'signature' | 'new' | 'custom';
}

export interface ProductCategory {
  name: string;
  slug: ProductCategorySlug;
}

export type ProductCategorySlug =
  | 'all'
  | 'snack-attack'
  | 'thirst-quenchers'
  | 'everyday-essentials'
  | 'home-helpers'
  | 'camp-go'
  | 'best-bundles';


export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  summary?: string;
  imageUrls: string[];
  category: ProductCategorySlug;
  dataAiHint: string;
  badge?: ProductBadge;
  qty: number; // Added quantity
  status: 'has-stock' | 'out-of-stock'; // Added status
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
