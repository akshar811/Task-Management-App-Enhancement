const admin = require('firebase-admin');
const serviceAccount = require('../task-app-4b48e-firebase-adminsdk-ybzvt-e8a2063467.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const sendNotification = async (token, message) => {
    const payload = {
        notification: {
            title: message.title,
            body: message.body,
        },
        token: token,
    };

    try {
        const response = await admin.messaging().send(payload);
        console.log('Notification sent successfully:', response);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = {
    sendNotification,
};