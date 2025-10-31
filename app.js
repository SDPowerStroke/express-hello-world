const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- 1. SETUP ---
const app = express();
const PORT = process.env.PORT || 10000;
// Load the MongoDB URI from Render's environment variables
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors()); // Allows your external HTML form to communicate with the API
app.use(express.json()); // Parses incoming JSON data

// --- 2. DATABASE CONNECTION ---
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connection successful!');
    })
    .catch((error) => {
        console.error('❌ FATAL: MongoDB connection failed with error:', error.message);
        // Exits the process if the database connection fails
        process.exit(1); 
    });


// --- 3. MONGOOSE SCHEMA AND MODEL ---
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, // Ensures no duplicate usernames can be saved
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema); // 'User' is the collection name (MongoDB will use 'users')


// --- 4. API Route to Handle Registration ---
app.post('/submit-credentials', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Both username and password are required for registration.' });
    }

    try {
        // 1. Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'This username is already taken. Please choose another.' });
        }

        // 2. Create and save the new user
        const newUser = new User({ username, password });
        await newUser.save();

        res.status(201).json({ 
            message: 'User registered successfully!', 
            userId: newUser._id 
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});


// --- 5. API Route to Handle Login Check (/check-credentials) ---
app.post('/check-credentials', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Both username and password are required.' });
    }

    try {
        // Find ONE user where both username AND password match the input
        const user = await User.findOne({ username, password });

        if (user) {
            // User found! Credentials are correct.
            res.status(200).json({ success: true, message: 'Login successful!' });
        } else {
            // User not found, or password did not match.
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ success: false, message: 'Internal server error during login check.' });
    }
});


// --- 6. START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
