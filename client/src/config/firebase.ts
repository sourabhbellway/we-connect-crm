import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { isSupported, getMessaging, Messaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCD1pWLF1zGJ_vuVuv9p0foEBjeFB_9C8o",
  authDomain: "weconnect-c70a4.firebaseapp.com",
  projectId: "weconnect-c70a4",
  storageBucket: "weconnect-c70a4.firebasestorage.app",
  messagingSenderId: "406989897488",
  appId: "1:406989897488:web:e805d62697d7d312f5af95",
  measurementId: "G-QRL0MVYVQV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Messaging initialization (safe for non-HTTPS/unsupported browsers)
let messaging: Messaging | null = null;

// Only initialize if supported
isSupported()
  .then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    } else {
      console.warn(
        "Firebase Messaging is not supported in this browser environment (likely due to non-HTTPS connection)."
      );
    }
  })
  .catch((err) => {
    console.error("Error checking Firebase Messaging support:", err);
  });

export { app, analytics, messaging };
