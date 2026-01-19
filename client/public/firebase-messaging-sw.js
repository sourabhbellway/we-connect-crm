importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCD1pWLF1zGJ_vuVuv9p0foEBjeFB_9C8o",
    authDomain: "weconnect-c70a4.firebaseapp.com",
    projectId: "weconnect-c70a4",
    storageBucket: "weconnect-c70a4.firebasestorage.app",
    messagingSenderId: "406989897488",
    appId: "1:406989897488:web:e805d62697d7d312f5af95",
    measurementId: "G-QRL0MVYVQV"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png' // Ensure this icon exists or change to a valid path
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
