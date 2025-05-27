
import type { Product, ProductCategorySlug } from '@/lib/types';

export const mockProducts: Product[] = [
  // Snack Attack
  {
    id: 'sa1',
    name: 'Spicy Chili Chips',
    price: 3.99,
    description: 'Extra crispy potato chips with a fiery chili kick. Perfect for a daring snack time. Made with real potatoes and a blend of secret spices that will leave you wanting more. Not for the faint of heart!',
    summary: '🌶️ Fiery chili kick, extra crispy!',
    imageUrls: [
        'https://placehold.co/600x800.png',
        'https://placehold.co/600x800.png',
        'https://placehold.co/600x800.png',
        'https://placehold.co/600x800.png'
    ],
    category: 'snack-attack' as ProductCategorySlug,
    dataAiHint: 'chips spicy',
    badge: { text: '🔥 Hot', type: 'hot' },
    qty: Math.floor(Math.random() * 21), // Random qty 0-20
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'sa2',
    name: 'Chocolate Chunk Cookies (3-pack)',
    price: 5.50,
    description: 'Soft, chewy cookies packed with generous chocolate chunks. A classic comfort treat, baked fresh daily. Each bite is a delightful mix of buttery cookie and rich, melted chocolate.',
    summary: '🍪 Soft, chewy, chocolatey goodness.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'snack-attack' as ProductCategorySlug,
    dataAiHint: 'cookies chocolate',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'sa3',
    name: 'Quick Beef Ramen Bowl',
    price: 4.75,
    description: 'A satisfying bowl of instant ramen with rich beef broth and noodles. Ready in minutes for a quick and hearty meal. Comes with a vegetable packet and seasoning oil for authentic flavor.',
    summary: '🍜 Rich beef broth, ready in minutes.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'snack-attack' as ProductCategorySlug,
    dataAiHint: 'ramen beef',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'sa4',
    name: 'Salted Caramel Popcorn',
    price: 4.25,
    description: 'Sweet and salty, this gourmet popcorn is an irresistible treat for movie nights or anytime snacking. Each kernel is perfectly coated.',
    summary: '🍿 Sweet, salty, irresistible.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'snack-attack' as ProductCategorySlug,
    dataAiHint: 'popcorn caramel',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'sa5',
    name: 'Mini Pretzels Pouch',
    price: 2.99,
    description: 'Classic crunchy mini pretzels, lightly salted. A perfect on-the-go snack or for dipping. Comes in a convenient resealable pouch.',
    summary: '🥨 Crunchy, salty, classic.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'snack-attack' as ProductCategorySlug,
    dataAiHint: 'pretzels mini',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },


  // Thirst Quenchers
  {
    id: 'tq1',
    name: 'Sparkling Lemonade',
    price: 2.50,
    description: 'Refreshing and bubbly lemonade with a zesty citrus twist. Quench your thirst with this delightful sparkling beverage. Made with real lemon juice and a hint of sweetness.',
    summary: '🍋 Zesty, bubbly, and refreshing.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'thirst-quenchers' as ProductCategorySlug,
    dataAiHint: 'lemonade sparkling',
    badge: { text: '✨ NEW', type: 'new' },
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'tq2',
    name: 'Cold Brew Coffee Can',
    price: 4.20,
    description: 'Smooth and strong cold brew coffee, conveniently canned for your caffeine fix. Steeped for 12 hours for a low-acid, rich flavor. Perfect for a morning boost or afternoon pick-me-up.',
    summary: '☕ Smooth, strong, convenient caffeine.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'thirst-quenchers' as ProductCategorySlug,
    dataAiHint: 'coffee coldbrew',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'tq3',
    name: 'Pure Coconut Water',
    price: 3.00,
    description: 'Natural and hydrating coconut water, packed with electrolytes. No added sugar, just pure refreshment from young coconuts. A healthy way to stay hydrated throughout the day.',
    summary: '🥥 Naturally hydrating, electrolyte-rich.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'thirst-quenchers' as ProductCategorySlug,
    dataAiHint: 'coconut water',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'tq4',
    name: 'Mango Lassi Smoothie',
    price: 5.50,
    description: 'Creamy and refreshing mango lassi smoothie, a blend of ripe mangoes and yogurt. A taste of tropical paradise.',
    summary: '🥭 Creamy, tropical, delicious.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'thirst-quenchers' as ProductCategorySlug,
    dataAiHint: 'mango lassi',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'tq5',
    name: 'Green Tea with Honey',
    price: 2.75,
    description: 'Soothing green tea lightly sweetened with natural honey. A perfect calming beverage, hot or iced. Antioxidant-rich.',
    summary: '🍵 Soothing, light, healthy.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'thirst-quenchers' as ProductCategorySlug,
    dataAiHint: 'green tea',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },

  // Everyday Essentials
  {
    id: 'ee1',
    name: 'Travel Toothbrush Kit',
    price: 6.00,
    description: 'Compact toothbrush and mini toothpaste set, perfect for on-the-go oral hygiene. Includes a travel case to keep your toothbrush clean and protected. Ideal for travel or your gym bag.',
    summary: '🦷 Compact oral hygiene on the go.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'everyday-essentials' as ProductCategorySlug,
    dataAiHint: 'toothbrush kit',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'ee2',
    name: 'Pocket Hand Sanitizer',
    price: 2.99,
    description: 'Kills 99.9% of germs. Moisturizing formula, fits perfectly in your pocket or bag. Enriched with aloe vera to keep your hands soft. Lightly scented for a fresh feel.',
    summary: '🧴 Kills germs, moisturizing formula.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'everyday-essentials' as ProductCategorySlug,
    dataAiHint: 'hand sanitizer',
    badge: { text: '⭐ Signature', type: 'signature' },
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'ee3',
    name: 'All-Purpose Wet Wipes (10 pack)',
    price: 3.50,
    description: 'Gentle and effective wet wipes for quick cleanups. Fresh scent and alcohol-free. Perfect for hands, face, and surfaces when you\'re out and about. Resealable pack keeps wipes moist.',
    summary: '✨ Quick cleanups, fresh scent.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'everyday-essentials' as ProductCategorySlug,
    dataAiHint: 'wet wipes',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'ee4',
    name: 'Lip Balm SPF 15',
    price: 3.20,
    description: 'Moisturizing lip balm with SPF 15 protection. Keeps your lips soft, smooth, and protected from the sun. Cherry flavor.',
    summary: '👄 Moisturizing, SPF protection.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'everyday-essentials' as ProductCategorySlug,
    dataAiHint: 'lip balm',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'ee5',
    name: 'Travel Size Deodorant',
    price: 4.00,
    description: 'Compact deodorant stick offering all-day freshness. Perfect for travel or gym bags. Subtle, clean scent.',
    summary: '🌬️ All-day freshness, travel-friendly.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'everyday-essentials' as ProductCategorySlug,
    dataAiHint: 'deodorant travel',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },


  // Home Helpers
  {
    id: 'hh1',
    name: 'AA Alkaline Batteries (4-pack)',
    price: 5.25,
    description: 'Long-lasting AA batteries for your everyday devices. Reliable power for remote controls, toys, and more. Keep a pack handy so you\'re never without power when you need it.',
    summary: '🔋 Reliable power for devices.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'home-helpers' as ProductCategorySlug,
    dataAiHint: 'batteries AA',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'hh2',
    name: 'LED Night Light',
    price: 7.00,
    description: 'Energy-efficient LED night light with a soft glow. Auto dusk-to-dawn sensor. Provides gentle illumination for hallways, bathrooms, or children\'s rooms without disturbing sleep.',
    summary: '💡 Soft glow, auto sensor.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'home-helpers' as ProductCategorySlug,
    dataAiHint: 'night light',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'hh3',
    name: 'Multi-Surface Cleaning Spray',
    price: 4.99,
    description: 'Cuts through grease and grime on various surfaces. Leaves a streak-free shine and a fresh lemon scent. Effective on countertops, glass, and appliances. Biodegradable formula.',
    summary: '🧼 Cuts grease, streak-free shine.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'home-helpers' as ProductCategorySlug,
    dataAiHint: 'cleaning spray',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
   {
    id: 'hh4',
    name: 'Reusable Shopping Bag',
    price: 3.50,
    description: 'Durable and foldable reusable shopping bag. An eco-friendly alternative to plastic bags. Holds a substantial amount of groceries.',
    summary: '🛍️ Eco-friendly, durable, foldable.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'home-helpers' as ProductCategorySlug,
    dataAiHint: 'reusable bag',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'hh5',
    name: 'Kitchen Sponge (3-pack)',
    price: 2.80,
    description: 'Heavy-duty kitchen sponges for effective cleaning. Dual-sided for scrubbing and wiping. Long-lasting and absorbent.',
    summary: '🧽 Heavy-duty, dual-sided.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'home-helpers' as ProductCategorySlug,
    dataAiHint: 'kitchen sponge',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },

  // Camp & Go
  {
    id: 'cg1',
    name: 'Compact First Aid Kit',
    price: 12.50,
    description: 'Essential first aid supplies in a portable, lightweight kit for minor emergencies. Includes bandages, antiseptic wipes, pain relievers, and more. A must-have for any outdoor adventure.',
    summary: '🩹 Essential supplies for minor emergencies.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'camp-go' as ProductCategorySlug,
    dataAiHint: 'firstaid kit',
    badge: { text: '⚡ Limited', type: 'limited' },
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'cg2',
    name: 'Insect Repellent Spray (Travel Size)',
    price: 6.75,
    description: 'Keeps mosquitoes and other biting insects away. DEET-free formula, safe for the whole family. Provides hours of protection so you can enjoy the outdoors without annoying bites.',
    summary: '🦟 DEET-free, long-lasting protection.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'camp-go' as ProductCategorySlug,
    dataAiHint: 'insect repellent',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'cg3',
    name: 'Instant Coffee Sachets (5 pack)',
    price: 3.20,
    description: 'Quick and easy coffee for your camping trips or early mornings. Just add hot water for a rich, aromatic cup. Each sachet is individually sealed for freshness.',
    summary: '☕ Quick coffee, just add hot water.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'camp-go' as ProductCategorySlug,
    dataAiHint: 'coffee sachets',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'cg4',
    name: 'Waterproof Matches',
    price: 3.00,
    description: 'Reliable waterproof matches, essential for camping and outdoor survival. Come in a sealed container. Lights even when wet.',
    summary: '🔥 Waterproof, reliable ignition.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'camp-go' as ProductCategorySlug,
    dataAiHint: 'waterproof matches',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'cg5',
    name: 'Headlamp LED',
    price: 15.00,
    description: 'Bright LED headlamp with multiple modes. Perfect for hands-free lighting during camping, hiking, or power outages. Adjustable strap.',
    summary: '🔦 Bright, hands-free, adjustable.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'camp-go' as ProductCategorySlug,
    dataAiHint: 'led headlamp',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },

  // Best Bundles
  {
    id: 'bb1',
    name: 'Movie Night Snack Box',
    price: 15.00,
    description: 'A curated box of popcorn, candy, and a drink. Perfect for a cozy movie night at home. Includes a bag of microwave popcorn, a chocolate bar, gummy candies, and a can of soda.',
    summary: '🎬 Popcorn, candy, and a drink!',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'best-bundles' as ProductCategorySlug,
    dataAiHint: 'movie snacks',
    badge: { text: '🎁 Bundle Deal', type: 'custom' },
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'bb2',
    name: 'Morning Kickstart Kit',
    price: 10.00,
    description: 'Includes instant coffee, a granola bar, and a fruit cup. Start your day right with this convenient breakfast bundle. Perfect for busy mornings or when you need a quick energy boost.',
    summary: '☀️ Coffee, granola, and fruit cup.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'best-bundles' as ProductCategorySlug,
    dataAiHint: 'breakfast kit',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'bb3',
    name: 'Travel Essentials Pack',
    price: 18.00,
    description: 'Hand sanitizer, wet wipes, travel toothbrush kit, and a pack of tissues. All your essential travel items in one convenient pack. Be prepared for any journey, long or short.',
    summary: '✈️ Sanitizer, wipes, toothbrush, tissues.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'best-bundles' as ProductCategorySlug,
    dataAiHint: 'travel kit',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'bb4',
    name: 'Self-Care Sunday Bundle',
    price: 22.00,
    description: 'Includes a face mask, bath bomb, scented candle, and herbal tea. Perfect for a relaxing self-care day. Treat yourself or a loved one.',
    summary: '🧖‍♀️ Relax, rejuvenate, pamper.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'best-bundles' as ProductCategorySlug,
    dataAiHint: 'selfcare kit',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  },
  {
    id: 'bb5',
    name: 'Office Snack Stash',
    price: 19.50,
    description: 'A variety of healthy and indulgent snacks to keep you going through the workday. Includes nuts, dried fruit, dark chocolate, and crackers.',
    summary: '💼 Healthy, indulgent, productive.',
    imageUrls: ['https://placehold.co/600x800.png'],
    category: 'best-bundles' as ProductCategorySlug,
    dataAiHint: 'office snacks',
    qty: Math.floor(Math.random() * 21),
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; }
  }
];
