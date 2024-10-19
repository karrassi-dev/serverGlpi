const admin = require('firebase-admin');
const serviceAccount = require('./flutter-gpi-firebase-adminsdk-yc1bb-dfda2689c2.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://flutter-gpi.firebaseio.com'
});

const db = admin.firestore();

module.exports = db; // Export the Firestore database instance
