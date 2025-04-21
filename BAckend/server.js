// d:\Project\shivraj Comapny pr\GlobentPro\BAckend\server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file FIRST
dotenv.config();

// Import routes AFTER dotenv.config() so they can access process.env
const authRoutes = require('./routes/auth'); // Ensure this path is correct
const quizRoutes = require('./routes/quiz'); // Ensure this path is correct

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; // Get URI from environment
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Get Frontend URL

// --- Middleware ---
// Enable CORS - Allow requests from your frontend origin
console.log(`Allowing CORS for origin: ${FRONTEND_URL}`);
app.use(cors({
  origin: FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true // Allow cookies/authorization headers if needed
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Routes ---
// Mount the authentication routes
app.use('/api/auth', authRoutes);
// Mount the quiz routes
app.use('/api/quiz', quizRoutes);

// Basic root route for testing
app.get('/', (req, res) => {
  res.send('GlobentPro Backend is running!');
});

// --- MongoDB Connection ---
if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in the environment variables (.env file).');
  process.exit(1); // Exit if DB connection string is missing
}

mongoose.connect(MONGO_URI, {
  // Note: useNewUrlParser, useUnifiedTopology, useCreateIndex, useFindAndModify
  // are no longer needed in Mongoose 6+ (they are default or removed)
  // If using Mongoose 5 or lower, keep them.
})
.then(() => {
  console.log('MongoDB connected successfully.');
  // Start the server only after successful DB connection
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    // Log JWT Secret source for debugging (remove in production)
    console.log(`JWT Secret loaded: ${process.env.JWT_SECRET ? 'From .env' : 'Using default fallback'}`);
  });
})
.catch(err => {
  console.error('!!! MongoDB connection error:', err.message);
  process.exit(1); // Exit the application if DB connection fails
});

// Optional: Handle Mongoose connection events after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB runtime error:', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected.');
});
