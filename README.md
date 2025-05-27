
# Good2Go Express

Good2Go Express is a Progressive Web App (PWA) designed for community residents to quickly pre-order groceries and meals. The app prioritizes a streamlined, no-login user experience, focusing on rapid product selection and a simplified packing/checkout process.

The core experience allows users to browse products, add them to a "packing list," and then confirm their selection, with an option to send the order details via WhatsApp to the vendor.

## Key Features:

*   **Fast Product Browsing:** Users can quickly view products in a grid or a Tinder-style swipe interface.
*   **Simplified "Packing List":** Instead of a traditional cart, users add items they are "interested" in to a list, which is then "packed" and confirmed.
*   **Step-by-Step Checkout:** A guided process for selecting pickup times and confirming the packing list.
*   **Optional WhatsApp Integration:** Users can choose to send their confirmed list directly to the vendor via WhatsApp.
*   **Mobile-First PWA:** Optimized for mobile browsers with PWA capabilities for an app-like experience.

## Technology Stack:

*   **Frontend:** Next.js (App Router), React
*   **UI Components:** Shadcn UI
*   **Styling:** Tailwind CSS
*   **Database:** Firebase Firestore (for dynamic product data management)
*   **AI (Planned/Optional):** Genkit (for potential future AI-powered features)

## Product Data Management:

This project is configured to load and display product information dynamically from **Firebase Firestore**. The `products` collection in Firestore serves as the single source of truth for all product details, including names, prices, descriptions, images, categories, and inventory status. This allows for easy updates and management of the product catalog without needing to redeploy the application.
