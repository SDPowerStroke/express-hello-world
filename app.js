const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Essential for connecting from a web page

const app = express();

// --- 1. Middleware Setup ---
// Allow the app to parse JSON bodies from incoming requests (like the one from the HTML form)
app.use(express.json()); 

// Configure CORS: This allows your frontend (even when running locally) to talk to your Render API
app.use(cors({
    origin: '*', // Allows all origins for simplicity in development. You can restrict this later.
    methods: ['GET', 'POST']
}));


// --- 2. MongoDB Connection (Uses the MONGO_URI from your Render Environment) ---
const MONGO_URI = process.env.MONGO_URI; 
const PORT = process.env.PORT || 3000;

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI environment variable is not set.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    
    // Start the Express server only after the database connection is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ FATAL: MongoDB connection failed with error:', err.message);
    process.exit(1); 
  });


// --- 3. Mongoose Schema and Model (Defining the 'User' Data) ---

// Define the structure for a user document
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensures no two users can have the same username
        trim: true
    },
    password: {
        type: String,
        required: true
    }
    // Note: In a real app, you would hash the password here (e.g., using bcrypt)
});

// Create the model, and explicitly tell Mongoose to use the 'User' collection (singular, capitalized)
// This matches your MongoDB setup exactly.
const User = mongoose.model('User', userSchema, 'User'); 


// --- 4. API Route to Handle Form Submission ---

// This POST endpoint receives the username and password from the HTML form
app.post('/submit-credentials', async (req, res) => {
    const { username, password } = req.body;

    // Basic validation to make sure both fields are present
    if (!username || !password) {
        // 400 Bad Request
        return res.status(400).json({ success: false, message: 'Both username and password are required.' });
    }

    try {
        // Create a new User document using the data
        const newUser = new User({ username, password });
        
        // Save the document to the MongoDB 'User' collection
        await newUser.save();

        // 201 Created - Send a success response back to the frontend
        res.status(201).json({ success: true, message: 'User created successfully!', user: { username: newUser.username } });

    } catch (error) {
        // Handle specific Mongoose errors, like duplicate key (username already exists)
        if (error.code === 11000) {
            // 409 Conflict
            return res.status(409).json({ success: false, message: 'This username is already taken. Please choose another.' });
        }
        
        // Handle other saving errors (e.g., validation failure)
        console.error('Database save error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while saving user.' });
    }
});
