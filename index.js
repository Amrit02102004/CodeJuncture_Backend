const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3040;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define mongoose schema
const registrationSchema = new mongoose.Schema({
  teamName: String,
  leaderName: String,
  leaderNum: String,
  memName: String,
  memNum: String
});

// Create mongoose model
const Registration = mongoose.model('Registration', registrationSchema);

// Middleware
app.use(bodyParser.json());

// Route to handle registration
app.post('/register', async (req, res) => {
  try {
    const { teamName, leaderName, leaderNum, memName, memNum } = req.body;

    // Create a new registration document
    const registration = new Registration({
      teamName: teamName,
      leaderName: leaderName,
      leaderNum: leaderNum,
      memName: memName,
      memNum: memNum
    });

    // Save the registration document
    await registration.save();

    res.status(200).json({ message: 'Registration successful', registration: registration });
  } catch (error) {
    console.error('Error registering:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
