
// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// IMPORTANT: Replace these with your actual Firebase project configuration!
const firebaseConfig = {
  apiKey: "AIzaSyAuGujKvKHvFZ1I9GBgT2r81Uqv4AB7SdA",
  authDomain: "good2go-express.firebaseapp.com",
  projectId: "good2go-express",
  storageBucket: "good2go-express.firebasestorage.app",
  messagingSenderId: "905482893627",
  appId: "1:905482893627:web:8a9b7ff74b2520160d9f1e"
};

let app: FirebaseApp;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);

export { db, app };
