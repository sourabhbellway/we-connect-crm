
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountRaw) {
    console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT not found in .env');
    process.exit(1);
}

try {
    const serviceAccount = JSON.parse(serviceAccountRaw);

    // Initialize Firebase Admin
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin Initialized');
    }

    // Get token from command line arg
    const targetToken = process.argv[2];

    if (!targetToken) {
        console.log('\nUsage: node test-notification.js <FCM_TOKEN>');
        console.log('Please provide the FCM token as an argument.\n');
        process.exit(0);
    }

    console.log(`\n📧 Attempting to send test notification to:\n${targetToken.substring(0, 20)}...\n`);

    const message = {
        notification: {
            title: 'Test Notification',
            body: 'This is a test message from your WeConnect CRM Backend!',
        },
        token: targetToken,
    };

    admin.messaging().send(message)
        .then((response) => {
            console.log('✅ Successfully sent message:', response);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error sending message:', error);
            process.exit(1);
        });

} catch (error) {
    console.error('❌ Error parsing service account or initializing:', error);
    process.exit(1);
}
