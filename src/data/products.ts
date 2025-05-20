
import type { Product } from '@/lib/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Fresh Avocado Bowl',
    price: 8.99,
    description: 'Creamy avocado, mixed greens, cherry tomatoes, and a light vinaigrette for a healthy kick.',
    imageUrl: 'https://placehold.co/300x388.png', // Adjusted for 1:1 ratio
    category: 'Bowls',
    dataAiHint: 'avocado bowl',
    badge: { text: '🔥 热卖', type: 'hot' },
  },
  {
    id: '2',
    name: 'Spicy Chicken Wrap',
    price: 7.50,
    description: 'Grilled spicy chicken, lettuce, tomato, and a tangy sauce in a whole wheat wrap, perfect for on-the-go.',
    imageUrl: 'https://placehold.co/300x388.png',
    category: 'Wraps',
    dataAiHint: 'chicken wrap',
    badge: { text: '🍱 招牌', type: 'signature' },
  },
  {
    id: '3',
    name: 'Berry Blast Smoothie',
    price: 5.99,
    description: 'A refreshing blend of mixed berries, banana, and yogurt, packed with vitamins.',
    imageUrl: 'https://placehold.co/300x388.png',
    category: 'Drinks',
    dataAiHint: 'berry smoothie',
  },
  {
    id: '4',
    name: 'Quinoa Salad Delight',
    price: 9.25,
    description: 'Nutrient-packed quinoa salad with roasted vegetables and feta cheese. A light yet satisfying option.',
    imageUrl: 'https://placehold.co/300x388.png',
    category: 'Salads',
    dataAiHint: 'quinoa salad',
    badge: { text: '⚡ 限量', type: 'limited' },
  },
  {
    id: '5',
    name: 'Artisan Cold Brew',
    price: 4.50,
    description: 'Smooth and rich cold brew coffee, steeped for 12 hours for maximum flavor.',
    imageUrl: 'https://placehold.co/300x388.png',
    category: 'Drinks',
    dataAiHint: 'cold brew',
  },
  {
    id: '6',
    name: 'Gourmet Veggie Burger',
    price: 10.50,
    description: 'A delicious plant-based patty with all the fixings on a brioche bun. Pure satisfaction.',
    imageUrl: 'https://placehold.co/300x388.png',
    category: 'Burgers',
    dataAiHint: 'veggie burger',
    badge: { text: '✨ NEW', type: 'new' },
  },
];
