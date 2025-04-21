// d:\Project\shivraj Comapny pr\GlobentPro\BAckend\routes\auth.js
const express = require('express');
const bcrypt = require('bcrypt'); // Use bcrypt for hashing
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure path is correct

const router = express.Router();

// *** Use environment variable for JWT Secret ***
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables (.env file). Auth routes will fail.");
    // Optionally exit: process.exit(1);
}

// --- Login Route ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for email:', email); // Avoid logging password

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user by email (case-insensitive search is often better)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.warn('Login failed: User not found for email:', email);
      // Use a generic message for security to prevent email enumeration
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // *** Compare hashed password using the method from User model ***
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn('Login failed: Password mismatch for email:', email);
      // Use a generic message for security
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // *************************************************************

    // Check if JWT_SECRET is loaded before signing
    if (!JWT_SECRET) {
        console.error('Login Error: JWT_SECRET is missing.');
        return res.status(500).json({ error: 'Server configuration error: Cannot sign token.' });
    }

    // Generate a token (payload includes user ID)
    const payload = { id: user._id }; // Ensure payload contains 'id' for 'protect' middleware
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Use consistent secret

    console.log(`Login successful for ${user.email}`);
    // Return token and user info needed by frontend
    res.status(200).json({
        token,
        username: user.username,
        email: user.email
    });

  } catch (error) {
    console.error('Error during login process:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// --- Signup Route ---
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Signup attempt for email:', email); // Avoid logging password

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  // Add more validation (e.g., password strength, username format) if needed

  try {
    // Check if email or username already exists (case-insensitive)
    const existingUser = await User.findOne({
        $or: [
            { email: email.toLowerCase() },
            { username: username } // Consider if username should also be case-insensitive
        ]
    });

    if (existingUser) {
       if (existingUser.email === email.toLowerCase()) {
           console.warn('Signup failed: Email already exists:', email);
           return res.status(400).json({ error: 'Email already exists' });
       }
       // Add check for username if needed
       if (existingUser.username === username) {
            console.warn('Signup failed: Username already exists:', username);
           return res.status(400).json({ error: 'Username already exists' });
       }
    }

    // Create new user instance (password will be hashed by pre-save hook in User model)
    const newUser = new User({
        username: username.trim(), // Trim whitespace
        email: email.toLowerCase().trim(),
        password: password // Pass plain password, hook will hash it
    });

    // Save the user (pre-save hook runs here)
    await newUser.save();
    console.log(`Signup successful for ${newUser.email}`);

    // Check if JWT_SECRET is loaded before signing
    if (!JWT_SECRET) {
        console.error('Signup Error: JWT_SECRET is missing.');
        // User was created, but token cannot be generated - decide how to handle
        // Option 1: Return success without token (user needs to login)
        // return res.status(201).json({ message: "Signup successful, please log in.", username: newUser.username, email: newUser.email });
        // Option 2: Return server error
        return res.status(500).json({ error: 'Server configuration error: Cannot sign token.' });
    }

    // Generate a token for the new user
    const payload = { id: newUser._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Return token and user info
    res.status(201).json({
        token,
        username: newUser.username,
        email: newUser.email
    });

  } catch (error) {
    console.error('Error during signup process:', error);
    // Handle potential duplicate key errors during save if the initial check misses a race condition
    if (error.code === 11000) {
        return res.status(400).json({ error: 'Email or Username already exists (database constraint).' });
    }
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ error: 'Validation failed', details: messages.join(', ') });
    }
    res.status(500).json({ error: 'Server error during signup' });
  }
});

module.exports = router;
