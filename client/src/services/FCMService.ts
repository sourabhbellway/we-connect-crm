import { getToken, onMessage, isSupported } from "firebase/messaging";
import { messaging } from "../config/firebase";

export const requestForToken = async () => {
    try {
        const supported = await isSupported();
        if (!supported || !messaging) {
            console.log("Firebase Messaging is not supported or initialized.");
            return null;
        }

        const currentToken = await getToken(messaging, {
            vapidKey: "BH8ACUfuz9GA14CtHzyHCh6AVTcCBkrSRex9rvCFh5GhvC5i-5pQBnvB6AvyGSLOArF07mGJY41SxEsd9gMGPHg"
        });

        if (currentToken) {
            console.log("current token for client: ", currentToken);
            return currentToken;
        } else {
            console.log("No registration token available. Request permission to generate one.");
            return null;
        }
    } catch (err) {
        console.log("An error occurred while retrieving token. ", err);
        return null;
    }
};

export const onMessageListener = (callback: (payload: any) => void) => {
    // Return early if not supported or not initialized
    if (!messaging) return () => { };

    return onMessage(messaging, (payload) => {
        callback(payload);
    });
};
