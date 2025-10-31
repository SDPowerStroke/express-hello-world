const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express();

// --- 1. Middleware Setup ---
// Allow cross-origin requests from your HTML form
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST']
}));
app.use(express.json()); 


// --- 2. Configuration and MongoDB Connection ---
// Render automatically sets the PORT and the MONGO_URI
const MONGO_URI = process.env.MONGO_URI; 
const PORT = process.env.PORT || 10000; // Use port 10000 which Render detects

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI environment variable is not set.");
    process.exit(1);
}

// Connect to MongoDB using the URI from the Render environment variable
// Mongoose handles the MongoDB driver connection in the background
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    
    // Start the Express server only after a successful database connection
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    // This logs the 'bad auth' or 'ENOTFOUND' errors you've been seeing
    console.error('❌ FATAL: MongoDB connection failed with error:', err.message);
    process.exit(1); 
  });


// --- 3. Mongoose Schema and Model ---

// Define the data structure for documents in the 'User' collection
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Key constraint: only one user per username
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

// Create the model, explicitly targeting the 'User' collection
// This matches your Atlas setup: Users (DB) -> User (Collection)
const User = mongoose.model('User', userSchema, 'User'); 


// --- 4. API Route to Handle Form Submission ---

// POST route to receive and save new credentials
app.post('/submit-credentials', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Both username and password are required.' });
    }

    try {
        // Create and save the new user document
        const newUser = new User({ username, password });
        await newUser.save();

        res.status(201).json({ success: true, message: 'User created successfully!', user: { username: newUser.username } });

    } catch (error) {
        // Handle Mongoose Duplicate Key Error (code 11000)
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'This username is already taken. Please choose another.' });
        }
        
        console.error('Database save error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while saving user.' });
    }
});
