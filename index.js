// index.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors'); // Essential for fixing the Network Error issue
require('dotenv').config(); // Load environment variables

// --- The Mongoose Model must be required AFTER Mongoose itself is defined ---
// Ensure your models/Application.js file is present and correct
const Application = require('./models/Application'); 

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Allow requests from your browser (localhost:3000)
app.use(express.json()); // To parse JSON bodies from POST requests
app.use(express.static(path.join(__dirname, 'public'))); // To serve HTML, CSS, JS

// --- Database Connection (Using Mongoose) ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in .env file.");
    process.exit(1);
}

// 1. Initiate connection (Mongoose handles retry/connection internally)
mongoose.connect(MONGO_URI);

// 2. Listen for connection events
const db = mongoose.connection;
db.on('error', (err) => {
    // This catches issues like "bad auth"
    console.error('MongoDB connection error:', err);
    // Do NOT exit here if you want the server to try reconnecting. For this project, exiting is fine.
    process.exit(1); 
});
db.once('open', () => {
    // This confirms the connection is stable before proceeding
    console.log('MongoDB connected successfully.');
});


// --- API route to handle application submissions ---
app.post('/api/apply', async (req, res) => {
    try {
        console.log("Full Request Body:", req.body); // Check your logs for this!

        const { name, dept, year, regNo, email, track, quizScore, challengeResponse, essayResponse } = req.body;

        // Check each one individually to find the culprit
        const required = { name, dept, year, regNo, email, track, essayResponse };
        for (const [key, value] of Object.entries(required)) {
            if (!value) {
                console.log(`Missing field identified: ${key}`);
                return res.status(400).json({ success: false, message: `Field "${key}" is missing.` });
            }
        }

        const newApplication = new Application(req.body);
        await newApplication.save();
        
        res.status(201).json({ success: true, message: 'Application submitted!' });
    } catch (error) {
        console.error("Database Save Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Simple root route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Use Ctrl+C to stop the server.');
});