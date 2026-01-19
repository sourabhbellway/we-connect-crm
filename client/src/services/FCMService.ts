import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase";

export const requestForToken = async () => {
    try {
        const currentToken = await getToken(messaging, {
            vapidKey: "BH8ACUfuz9GA14CtHzyHCh6AVTcCBkrSRex9rvCFh5GhvC5i-5pQBnvB6AvyGSLOArF07mGJY41SxEsd9gMGPHg"
        });

        if (currentToken) {
            console.log("current token for client: ", currentToken);
            // TODO: Send the token to your server and update the UI if necessary
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
    return onMessage(messaging, (payload) => {
        callback(payload);
    });
};
