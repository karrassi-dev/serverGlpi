const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');


const serviceAccount = require('./flutter-gpi-firebase-adminsdk-yc1bb-dfda2689c2.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.post('/send-notification', async (req, res) => {
  const { tokens, message } = req.body;

  let successCount = 0;
  let failureCount = 0;
  const errors = []; 


  for (const token of tokens) {
    const payload = {
      notification: {
        title: 'New Equipment Request',
        body: message,
      },
      token: token, 
    };

    try {
      await admin.messaging().send(payload);
      successCount++; 
    } catch (error) {
      console.error('Error sending notification to', token, error);
      failureCount++; 
      errors.push({ token, error: error.message });
    }
  }

  // Send detailed response
  res.status(200).send({
    message: 'Notification process completed',
    successCount,
    failureCount,
    errors,
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
