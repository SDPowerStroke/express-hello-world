const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 

const app = express();

// --- 1. Middleware Setup ---
// Enable CORS for cross-origin requests (allows your HTML form to talk to the Render API)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST']
}));

// Enable parsing of JSON body data from the incoming requests
app.use(express.json()); 


// --- 2. MongoDB Connection Setup ---
const MONGO_URI = process.env.MONGO_URI; 
const PORT = process.env.PORT || 3000;

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI environment variable is not set. Cannot connect to database.");
    process.exit(1);
}

// Connect to MongoDB using the URI from the Render environment variable
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    
    // Start the Express server only after a successful database connection
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ FATAL: MongoDB connection failed with error:', err.message);
    // Crash the app if the database connection fails
    process.exit(1); 
  });


// --- 3. Mongoose Schema and Model ---

// Define the data structure for documents in the 'User' collection
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Guarantees that two users cannot have the same username
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

// Create the model, explicitly targeting the 'User' collection (singular, capitalized)
const User = mongoose.model('User', userSchema, 'User'); 


// --- 4. API Route to Handle Form Submission ---

// POST route to receive and save new credentials
app.post('/submit-credentials', async (req, res) => {
    const { username, password } = req.body;

    // Server-side validation
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Both username and password are required.' });
    }

    try {
        // Create and save the new user document
        const newUser = new User({ username, password });
        await newUser.save();

        // Success response
        res.status(201).json({ success: true, message: 'User created successfully!', user: { username: newUser.username } });

    } catch (error) {
        // Handle Mongoose Duplicate Key Error (username conflict)
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'This username is already taken. Please choose another.' });
        }
        
        console.error('Database save error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while saving user.' });
    }
});

// A simple root GET route for testing the server is alive
app.get('/', (req, res) => {
    res.send('Proto-Nova API is running. Use the /submit-credentials endpoint to post data.');
});
