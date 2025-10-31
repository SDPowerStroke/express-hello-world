// app.js or server.js

const mongoose = require('mongoose');
const express = require('express');
const app = express(); // Initialize your Express app

// Render provides the PORT environment variable
const PORT = process.env.PORT || 3000; // Use Render's port or default to 3000

// ... Database connection setup ...

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    
    // ------------------------------------------------------------------
    // THIS IS THE CRITICAL MISSING STEP: START THE WEB SERVER
    // ------------------------------------------------------------------
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });

  })
  .catch(err => {
    console.error('❌ FATAL: MongoDB connection failed:', err);
    process.exit(1); 
  });
