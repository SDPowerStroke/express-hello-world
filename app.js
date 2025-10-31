const mongoose = require('mongoose');

// The environment variable name MUST match the KEY you set on Render
const MONGO_URI = process.env.MONGO_URI; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connection successful!'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    // You might want to exit the app if the connection fails
    // process.exit(1); 
  });

// ... rest of your Express app code
