
'use server'; // Potentially, if these functions are called from Server Components or Server Actions directly.
              // However, if primarily called from 'use client' components via useEffect, this is not strictly necessary here.

import type { Product, ProductCategorySlug } from '@/lib/types';
import { db } from '@/lib/firebase'; // Assuming db is exported from firebase.ts
import { collection, getDocs, doc, getDoc, query, where, DocumentData } from 'firebase/firestore';

// Helper function to convert Firestore doc data to Product type
const mapDocToProduct = (docData: DocumentData, id: string): Product => {
  // Ensure all fields are correctly typed and defaults are handled if necessary
  return {
    id: id,
    name: docData.name || '',
    price: typeof docData.price === 'number' ? docData.price : 0,
    description: docData.description || '',
    summary: docData.summary || '',
    imageUrls: Array.isArray(docData.imageUrls) ? docData.imageUrls : ['https://placehold.co/600x400.png'],
    category: docData.category || 'all', // default category if missing
    dataAiHint: docData.dataAiHint || '',
    badge: docData.badge || undefined,
    qty: typeof docData.qty === 'number' ? docData.qty : 0,
    // Status is a getter in the original mock, so we derive it or expect it from Firestore
    get status() { return this.qty > 0 ? 'has-stock' : 'out-of-stock'; },
    ...docData, // Spread remaining fields, ensure type safety if possible
  } as Product;
};


export async function loadProductsFromFirestore(categorySlug?: ProductCategorySlug): Promise<Product[]> {
  try {
    const productsCollectionRef = collection(db, 'products');
    let q = query(productsCollectionRef);

    if (categorySlug && categorySlug !== 'all') {
      q = query(productsCollectionRef, where('category', '==', categorySlug));
    }

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      products.push(mapDocToProduct(docSnap.data(), docSnap.id));
    });
    return products;
  } catch (error) {
    console.error("Error loading products from Firestore:", error);
    return []; // Return empty array on error
  }
}

export async function loadProductByIdFromFirestore(productId: string): Promise<Product | null> {
  try {
    const productDocRef = doc(db, 'products', productId);
    const docSnap = await getDoc(productDocRef);

    if (docSnap.exists()) {
      return mapDocToProduct(docSnap.data(), docSnap.id);
    } else {
      console.warn(`Product with ID ${productId} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`Error loading product with ID ${productId} from Firestore:`, error);
    return null; // Return null on error
  }
}
