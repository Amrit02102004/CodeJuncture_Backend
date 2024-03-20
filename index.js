const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3040;
console.log(process.env.MONGODB_URI);
const xlsx = require('xlsx');
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
const cors = require('cors');
app.use(cors({ origin: true }));

const rateLimit = require('express-rate-limit');
// Define rate limiting options
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 550, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

// Apply the rate limiter to the specified route
app.use('/register', limiter);

const registrationSchema = new mongoose.Schema({
  teamName: String,
  leaderName: String,
  leaderNum: String,
  memName: String,
  memNum: String
});

const Registration = mongoose.model('users', registrationSchema);

app.use(bodyParser.json());

// Route to handle registration
app.post('/register', async (req, res) => {
  try {
    const { teamName, leaderName, leaderNum, memName, memNum } = req.body;

    // Check if team name already exists
    const existingTeam = await Registration.findOne({ teamName: teamName });

    if (existingTeam) {
      return res.status(400).json({ error: 'Team name already exists' });
    }

    // Check if leader name or registration number already exists
    const existingUser = await Registration.findOne({ $or: [{ leaderName: leaderName }, { leaderNum: leaderNum }] });

    if (existingUser) {
      return res.status(400).json({ error: 'Leader name or registration number already exists' });
    }

    // Check if member name or registration number already exists
    const existingMember = await Registration.findOne({ $or: [{ memName: memName }, { memNum: memNum }] });

    if (existingMember) {
      console.log("Mem Found");
      return res.status(400).json({ error: 'Member name or registration number already exists' });
    }

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

    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error registering:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to download registrations as Excel file
const json2csv = require('json2csv').Parser;

// Route to download registrations as CSV file
app.get('/download', async (req, res) => {
  try {
    // Fetch registrations from the database, excluding internal Mongoose properties
    const registrations = await Registration.find({}, { __v: 0, _id: 0 });
    const data = registrations.map(registration => ({
      'Team Name': registration.teamName,
      'Leader Name': registration.leaderName,
      'Leader Number': registration.leaderNum,
      'Member Name': registration.memName,
      'Member Number': registration.memNum
    }));

    console.log(data);

    // Convert JSON data to CSV format
    const json2csvParser = new json2csv();
    const csvData = json2csvParser.parse(data);

    // Set response headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    res.setHeader('Content-Type', 'text/csv');

    // Send the CSV data as response
    res.send(csvData);
  } catch (error) {
    console.error('Error generating CSV file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/download`);
});
