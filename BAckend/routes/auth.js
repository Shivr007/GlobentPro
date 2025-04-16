const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Log the incoming login data
  console.log('Login Data:', req.body);

  // Validate incoming data
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Error: User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the plain text password in the database
    if (password !== user.password) {
      console.error('Error: Invalid credentials');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate a token
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
    res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Log the incoming signup data
  console.log('Signup Data:', req.body);

  // Validate incoming data
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Save the new user without hashing the password
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Generate a token
    const token = jwt.sign({ id: newUser._id }, 'secret', { expiresIn: '1h' });
    res.status(201).json({ token, username: newUser.username });
  } catch (error) {
    console.error('Error during signup:', error);
    console.log('Error details:', error.message);
    
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;