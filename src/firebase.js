import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQl2BdpgnWaL61uL05SwnUD3SfHeDJc7U",
  authDomain: "post-studio-1508a.firebaseapp.com",
  projectId: "post-studio-1508a",
  storageBucket: "post-studio-1508a.firebasestorage.app",
  messagingSenderId: "53741095037",
  appId: "1:53741095037:web:afc58fe6dcde430e01c914"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and Firestore
export const storage = getStorage(app);
export const db = getFirestore(app);
