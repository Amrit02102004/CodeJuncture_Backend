const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const auth = process.env.auth;
// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/serviceAccountKey.json'); // Replace with your service account key file path
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3040;

app.use(bodyParser.json());

app.post('/register', async (req, res) => {
  try {
    const { teamName, leaderName, leaderNum, memName, memNum } = req.body;

    const docRef = await db.collection('registrations').add({
      teamName: teamName,
      leaderName: leaderName,
      leaderNum: leaderNum,
      memName: memName,
      memNum: memNum
    });

    res.status(200).json({ message: 'Registration successful', id: docRef.id });
  } catch (error) {
    console.error('Error registering:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
