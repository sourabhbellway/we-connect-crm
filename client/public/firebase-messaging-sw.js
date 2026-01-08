// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCD1pWLF1zGJ_vuVuv9p0foEBjeFB_9C8o",
    authDomain: "weconnect-c70a4.firebaseapp.com",
    projectId: "weconnect-c70a4",
    storageBucket: "weconnect-c70a4.firebasestorage.app",
    messagingSenderId: "406989897488",
    appId: "1:406989897488:web:e805d62697d7d312f5af95",
    measurementId: "G-QRL0MVYVQV"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'WeConnect CRM';
    const notificationOptions = {
        body: payload.notification?.body || 'New notification',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: payload.data?.callId || 'notification',
        data: payload.data,
        requireInteraction: true,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);

    event.notification.close();

    // Open the app or focus existing window
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }

            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
