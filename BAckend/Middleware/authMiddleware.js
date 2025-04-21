// d:\Project\shivraj Comapny pr\GlobentPro\BAckend\middleware\authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path if needed

// Load JWT secret and Admin Emails from environment variables
// Ensure JWT_SECRET matches the one used in routes/auth.js
const JWT_SECRET = process.env.JWT_SECRET; // Rely on .env, remove fallback 'secret'
const ADMIN_EMAILS_STRING = process.env.ADMIN_EMAILS || ''; // Get admin emails string from .env

// Process the admin emails string into an array for easy checking
const ADMIN_EMAILS = ADMIN_EMAILS_STRING.split(',')
  .map(email => email.trim().toLowerCase())
  .filter(email => email); // Remove any empty strings

// Check if JWT_SECRET is loaded
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables (.env file). Authentication will fail.");
  // Optionally exit: process.exit(1); // More aggressive, stops server start
}

// Log loaded admin emails on server start for verification
if (ADMIN_EMAILS.length > 0) {
  console.log('Server Started: Loaded Admin Emails:', ADMIN_EMAILS);
} else {
  console.warn('Warning: No ADMIN_EMAILS found in .env file. Admin authorization will not work.');
}


// Middleware to verify JWT token and attach userId to the request object
const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header (format: "Bearer TOKEN_STRING")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the secret key from .env
      if (!JWT_SECRET) { // Double check here in case server started without it
        console.error('Protect Middleware Error: JWT_SECRET is missing.');
        return res.status(500).json({ error: 'Server configuration error: Missing JWT secret.' });
      }
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach the user ID from the token payload to the request object
      // Make sure the payload created during login/signup includes 'id'
      // Also attach the full user object (excluding password) if needed frequently
      req.userId = decoded.id;
      // Optionally fetch and attach user object here if needed by many subsequent routes
      // req.user = await User.findById(decoded.id).select('-password');
      // if (!req.user) return res.status(401).json({ error: 'Not authorized, user not found' });

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      // Handle errors during token verification
      let errorMessage = 'Not authorized, token failed';
      if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Not authorized, invalid token format';
      } else if (error.name === 'TokenExpiredError') {
        errorMessage = 'Not authorized, token expired';
      }
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ error: errorMessage });
    }
  }

  // If no token was found in the header
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};

// Middleware to check if the authenticated user is an admin based on email
const isAdmin = async (req, res, next) => {
  // This middleware must run AFTER 'protect', ensuring req.userId exists
  if (!req.userId) {
    console.error("isAdmin middleware error: req.userId not found. 'protect' middleware might be missing or failed before this.");
    return res.status(500).json({ error: 'Server error: User ID not available for admin check' });
  }

  try {
    // Fetch the user from the database using the ID from the token
    // Only select the 'email' field for efficiency
    const user = await User.findById(req.userId).select('email');

    // Check if the user exists in the database
    if (!user) {
      console.warn(`isAdmin check failed: User with ID ${req.userId} not found in database.`);
      return res.status(401).json({ error: 'Not authorized, user associated with token not found' });
    }

    // Check if the user's email (converted to lowercase) is in the ADMIN_EMAILS list
    const userEmailLower = user.email.toLowerCase();
    if (ADMIN_EMAILS.includes(userEmailLower)) {
      // User is an admin
      console.log(`Admin access granted for user: ${user.email} (ID: ${req.userId})`);
      next(); // Proceed to the next handler (e.g., the actual delete logic)
    } else {
      // User is authenticated but not listed as an admin
      console.warn(`Admin access denied for user: ${user.email} (ID: ${req.userId}). Not in admin list.`);
      return res.status(403).json({ error: 'Forbidden: User does not have admin privileges' });
    }
  } catch (error) {
    // Handle potential database errors during user lookup
    console.error('Error during admin check looking up user:', error);
    return res.status(500).json({ error: 'Server error during admin authorization check' });
  }
};

// Export the middleware functions
module.exports = { protect, isAdmin };
