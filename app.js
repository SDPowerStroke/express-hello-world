const mongoose = require('mongoose');
// ... other requires ...

const MONGO_URI = process.env.MONGO_URI; 

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI environment variable is not set.");
    process.exit(1); // Exit if config is missing
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    // *** IMPORTANT: START THE EXPRESS SERVER HERE ***
    // (e.g., app.listen(port, () => console.log('Server started')));
  })
  .catch(err => {
    // This will print the actual MongoDB connection error to the logs
    console.error('❌ FATAL: MongoDB connection failed with error:', err.message);
    process.exit(1); 
  });
