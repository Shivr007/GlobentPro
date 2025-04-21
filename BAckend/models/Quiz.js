// d:\Project\shivraj Comapny pr\GlobentPro\BAckend\models\Quiz.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Answer text is required'],
    trim: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  timeLimit: {
    type: Number,
    required: true,
    default: 30,
    min: [5, 'Time limit must be at least 5 seconds'],
    max: [120, 'Time limit cannot exceed 120 seconds']
  },
  points: {
    type: Number,
    required: true,
    default: 100,
    min: [0, 'Points cannot be negative']
  },
  answers: {
    type: [answerSchema],
    required: true,
    // Validate number of answers
    validate: [
        { validator: (val) => val.length >= 2 && val.length <= 6, msg: 'Must have between 2 and 6 answers' },
        // Validate that at least one answer is correct
        { validator: (val) => val.some(ans => ans.isCorrect === true), msg: 'At least one answer must be marked as correct' }
    ]
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  pin: {
    type: String,
    required: true,
    unique: true, // Enforce uniqueness at the database level
    index: true,  // Index for faster lookups by PIN
    minlength: 6, // Ensure length is exactly 6
    maxlength: 6,
    uppercase: true // Store PIN in uppercase for consistency
  },
  questions: {
    type: [questionSchema],
    required: true,
    validate: [val => val.length > 0, 'Quiz must have at least one question']
  },
  // *** Field to store the ID of the user who created the quiz ***
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // Store the user's MongoDB ID
    ref: 'User', // Reference the 'User' model (make sure 'User' matches your User model name)
    required: true, // Make it mandatory
    index: true // Index for faster lookups of user's quizzes
  },
  // **************************************************************
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true }); // Add createdAt and updatedAt timestamps automatically

module.exports = mongoose.model('Quiz', quizSchema);
