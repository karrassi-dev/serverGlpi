const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const serviceAccount = require('./flutter-gpi-firebase-adminsdk-yc1bb-dfda2689c2.json'); // Replace with the path to your Firebase service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

// Function to send notifications to all FCM tokens
const sendNotifications = async (message) => {
  try {
    const tokensSnapshot = await admin.firestore().collection('adminFcmToken').get();
    const tokens = [];

    tokensSnapshot.forEach((doc) => {
      tokens.push(doc.data().fcmToken);
    });

    if (tokens.length === 0) {
      console.log('No FCM tokens available');
      return;
    }

    const payload = {
      notification: {
        title: 'New Equipment Request',
        body: message,
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(payload);
    console.log('Notifications sent:', response.successCount);
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
};

// Endpoint to handle notification requests
app.post('/send-notification', async (req, res) => {
  const message = req.body.message;
  await sendNotifications(message);
  res.status(200).send('Notifications sent');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
