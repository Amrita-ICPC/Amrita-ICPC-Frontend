importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js');

// Must match the config locally
firebase.initializeApp({
    apiKey: "SENDER_ID_PLACEHOLDER_OR_DYNAMIC", 
    // Usually injected or partially hardcoded in SW context
    // Ideally loaded from indexdb or URL params, but often hardcoded if simple
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || "System Alert";
    const notificationOptions = {
        body: payload.notification?.body,
        icon: '/firebase-logo.png', // Replace with valid icon
        requireInteraction: true // Critical for proctoring alerts
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
