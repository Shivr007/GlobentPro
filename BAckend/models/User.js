// d:\Project\shivraj Comapny pr\GlobentPro\BAckend\models\User.js
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
  // Optional: Add role field if needed later
  // role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true }); // Add timestamps for createdAt/updatedAt

// --- Password Hashing Middleware (Mongoose Hook) ---
// Hash password BEFORE saving a new user or updating the password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error("Error hashing password for user:", this.email, error);
    next(error); // Pass error to Mongoose
  }
});

// --- Method to compare passwords (Optional but Recommended) ---
// Add a method to the User model to easily compare passwords during login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Error comparing password for user:", this.email, error);
    return false; // Return false on error
  }
};
// --- End Method ---

module.exports = mongoose.model('User', UserSchema);
