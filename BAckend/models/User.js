const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10; // Define salt rounds for hashing

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'] // Basic email format validation
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'] // Example validation
  },
}, { timestamps: true }); // Add timestamps for createdAt/updatedAt

// Password hashing middleware has been removed to store passwords in plain text

// Method to compare passwords (still needed for login)
// Now it just does a direct string comparison since passwords aren't hashed
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Direct string comparison instead of bcrypt.compare
    return this.password === candidatePassword;
  } catch (error) {
    console.error("Error comparing password for user:", this.email, error);
    return false; // Return false on error
  }
};

module.exports = mongoose.model('User', UserSchema);

