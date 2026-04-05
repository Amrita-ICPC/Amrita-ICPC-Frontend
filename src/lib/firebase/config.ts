import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, Messaging } from "firebase/messaging";
import { axiosWithAuth } from "../api-client";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const requestFirebaseNotificationPermission = async (): Promise<void> => {
    try {
        if (!("Notification" in window)) {
            console.warn("This browser does not support desktop notification");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const messaging = getMessaging(app);
            const currentToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
            });

            if (currentToken) {
                console.log("FCM Token retrieved. Registering with backend...");
                await axiosWithAuth({
                    url: '/api/v1/users/me/device-token',
                    method: 'POST',
                    data: { token: currentToken }
                });
            } else {
                console.warn("No registration token available. Request permission to generate one.");
            }
        }
    } catch (error) {
        console.error("An error occurred while retrieving token.", error);
    }
};

export { app };
