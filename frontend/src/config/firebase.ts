import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdvJvo1974fub09oCyj-qslvR4mFazhVY",
  authDomain: "dream-unlocker-mvp.firebaseapp.com",
  projectId: "dream-unlocker-mvp",
  storageBucket: "dream-unlocker-mvp.firebasestorage.app",
  messagingSenderId: "783523332470",
  appId: "1:783523332470:web:a590d98c24b36b0e413a57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
