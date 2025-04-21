// d:\Project\shivraj Comapny pr\GlobentPro\BAckend\routes\quiz.js
const express = require('express');
const mongoose = require('mongoose');
const Quiz    = require('../models/Quiz'); // Verify this path is correct
const router  = express.Router();
// Import Authentication/Authorization Middleware
// Ensure both protect and isAdmin are imported
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Ensure path is correct

// --- Helper Function to Generate PIN ---
function generateQuizPin() {
  const digits = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let pinArray = [];
  // Corrected loop conditions
  for (let i = 0; i < 2; i++) {
    pinArray.push(digits.charAt(Math.floor(Math.random() * digits.length)));
  }
  for (let i = 0; i < 4; i++) {
    pinArray.push(letters.charAt(Math.floor(Math.random() * letters.length)));
  }
  // Fisher-Yates shuffle
  for (let i = pinArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pinArray[i], pinArray[j]] = [pinArray[j], pinArray[i]];
  }
  return pinArray.join('');
}
// --- End Helper Function ---


// POST /api/quiz/create - Create a new quiz (Protected & Admin Only)
// Apply 'protect' first to verify login, then 'isAdmin' to check role
router.post('/create', protect, isAdmin, async (req, res) => {
  let attempts = 0;
  const maxAttempts = 10; // Max attempts to generate a unique PIN

  // Corrected loop condition
  while (attempts < maxAttempts) {
    const attemptStartTime = Date.now(); // Start timing the attempt
    let generatedPin = ''; // Define pin in the loop scope
    try {
      // Basic validation (more detailed validation in Mongoose schema)
      if (!req.body.title || !req.body.questions || req.body.questions.length === 0) {
          return res.status(400).json({ error: "Quiz title and at least one question are required." });
      }

      generatedPin = generateQuizPin(); // Generate PIN for this attempt
      console.log(`[Attempt ${attempts + 1}/${maxAttempts}] Generated PIN: ${generatedPin}`);

      const quizData = {
        title: req.body.title,
        description: req.body.description,
        questions: req.body.questions, // Assume frontend sends validated structure
        pin: generatedPin,
        createdBy: req.userId // Added by 'protect' middleware
      };

      const quiz = new Quiz(quizData);

      // Add timing for the save operation
      console.time(`[Attempt ${attempts + 1}] QuizSave-${generatedPin}`);
      await quiz.save(); // Attempt to save
      console.timeEnd(`[Attempt ${attempts + 1}] QuizSave-${generatedPin}`);

      const attemptEndTime = Date.now();
      // Log includes userId because 'protect' ran successfully, isAdmin confirmed role
      console.log(`[Attempt ${attempts + 1}] Quiz created successfully by ADMIN ${req.userId} with PIN: ${quiz.pin} (ID: ${quiz._id}) in ${attemptEndTime - attemptStartTime}ms`);
      // If save is successful, send response and exit the loop/function
      return res.status(201).json(quiz); // Return the created quiz object

    } catch (err) {
      const attemptEndTime = Date.now();
      // Check for duplicate key error specifically on the 'pin' index
      if (err.code === 11000 && err.keyPattern && err.keyPattern.pin) {
        console.warn(`[Attempt ${attempts + 1}] PIN collision detected for PIN: ${err.keyValue?.pin || generatedPin}. Retrying... (Took ${attemptEndTime - attemptStartTime}ms)`);
        attempts++; // Increment attempts and retry the loop
      } else {
        // Handle other errors (e.g., validation, database connection)
        console.error(`[Attempt ${attempts + 1}] Error creating quiz (non-collision):`, err);
        if (err.name === 'ValidationError') {
            // Corrected arrow function syntax
            const errors = Object.values(err.errors).map(el => el.message);
            return res.status(400).json({ error: "Validation failed", details: errors.join(', ') });
        }
        // Generic server error for other issues
        return res.status(500).json({ error: "Failed to create quiz", details: err.message });
      }
    }
  } // End while loop

  // If loop finishes because maxAttempts were reached
  console.error(`Failed to generate a unique PIN after ${maxAttempts} attempts. Last generated PIN might have been a collision.`);
  return res.status(500).json({ error: `Failed to generate a unique PIN for the quiz after ${maxAttempts} attempts. The system might be under high load or experiencing frequent PIN collisions. Please try again later.` });
});

// GET /api/quiz/my-quizzes - Fetch quizzes created by the logged-in user (Protected)
// Corrected arrow function syntax
router.get('/my-quizzes', protect, async (req, res) => {
    console.log(`Fetching quizzes created by user: ${req.userId}`);
    try {
        // Fetch full questions for potential display/edit later, or select less if only list needed
        const userQuizzes = await Quiz.find({ createdBy: req.userId })
                                      // .select('title description pin createdAt questions._id') // Example: Select less if needed
                                      .sort({ createdAt: -1 }); // Sort by newest first
        console.log(`Found ${userQuizzes.length} quizzes for user ${req.userId}`);
        res.status(200).json(userQuizzes);
    } catch (err) {
        console.error(`Error fetching quizzes for user ${req.userId}:`, err);
        res.status(500).json({ error: "Failed to fetch your quizzes", details: err.message });
    }
});


// GET /api/quiz/all - Fetch ALL quizzes (Public - No 'protect' middleware)
// Corrected arrow function syntax
router.get('/all', async (req, res) => {
  console.log("Attempting to fetch all quizzes...");
  try {
    // Ensure PIN is included for the User page 'Take Quiz' button
    // Select only necessary fields for the public listing
    const quizzes = await Quiz.find({})
                              .select('title description questions._id createdAt pin') // Select only needed fields
                              .sort({ createdAt: -1 });
    console.log(`Successfully fetched ${quizzes.length} quizzes.`);
    res.status(200).json(quizzes);
  } catch (err) {
    console.error("!!! Critical Error fetching all quizzes:", err);
    res.status(500).json({ error: "Failed to fetch quizzes", details: err.message });
  }
});


// GET /api/quiz/:id - Fetch a quiz by its MongoDB ID (Public)
// Corrected arrow function syntax
router.get('/:id', async (req, res) => {
   const { id } = req.params;
  console.log(`Attempting to fetch quiz with ID: ${id}`);
  try {
    // Validate the ID format before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.warn(`Invalid ID format received: ${id}`);
        return res.status(400).json({ error: 'Invalid Quiz ID format' });
    }
    // Fetch quiz - gets full document by default, needed for playing by ID
    const quiz = await Quiz.findById(id);

    if (!quiz) {
        console.warn(`Quiz not found for ID: ${id}`);
        return res.status(404).json({ error: 'Quiz not found' });
    }
    console.log(`Successfully fetched quiz: ${quiz._id}`);
    res.status(200).json(quiz); // Send full quiz details
  } catch (err) {
    console.error(`Error fetching quiz by ID (${id}):`, err);
    if (err.name === 'CastError') {
        console.warn(`CastError during findById for ID: ${id}`);
        return res.status(400).json({ error: 'Invalid Quiz ID format during query' });
    }
    res.status(500).json({ error: "Failed to fetch quiz", details: err.message });
  }
});


// GET /api/quiz/pin/:pin - Fetch a quiz by its 6-character PIN (Public)
// Corrected arrow function syntax and REMOVED restrictive .select()
router.get('/pin/:pin', async (req, res) => {
    let { pin } = req.params;
    if (!pin || typeof pin !== 'string') {
        return res.status(400).json({ error: 'PIN must be provided as a string.' });
    }
    pin = pin.toUpperCase().trim();
    if (!/^[A-Z0-9]{6}$/.test(pin)) {
         console.warn(`Invalid PIN format received or after sanitization: ${req.params.pin} -> ${pin}`);
         return res.status(400).json({ error: 'Invalid PIN format. Must be 6 uppercase letters or digits.' });
    }
    console.log(`Attempting to fetch quiz with PIN: ${pin}`);
    try {
        // *** FIX: Removed .select() to fetch the full quiz document ***
        // This ensures questions array contains full details (text, answers, etc.)
        const quiz = await Quiz.findOne({ pin: pin });

        if (!quiz) {
            console.warn(`Quiz not found for PIN: ${pin}`);
            return res.status(404).json({ error: 'Quiz not found for this PIN' });
        }
        console.log(`Successfully fetched full quiz by PIN: ${quiz._id}`);
        res.status(200).json(quiz); // Send the full quiz data
    } catch (err) {
        console.error(`Error fetching quiz by PIN (${pin}):`, err);
        res.status(500).json({ error: "Failed to fetch quiz by PIN", details: err.message });
    }
});

// DELETE /api/quiz/:id - Delete a quiz (Protected, Admin Only)
// Corrected arrow function syntax
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const quizId = req.params.id;
    console.log(`Admin user ${req.userId} attempting to delete quiz ${quizId}`);
    try {
        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            console.warn(`Admin delete failed: Invalid ID format ${quizId}`);
            return res.status(400).json({ error: 'Invalid Quiz ID format' });
        }
        // Use findByIdAndDelete for efficiency
        const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
        if (!deletedQuiz) {
            console.warn(`Admin delete failed: Quiz ${quizId} not found.`);
            return res.status(404).json({ error: 'Quiz not found' });
        }
        console.log(`Quiz ${quizId} deleted successfully by admin user ${req.userId}`);
        res.status(200).json({ message: 'Quiz deleted successfully by admin' }); // Confirmation message
    } catch (err) {
        console.error(`Error deleting quiz ${quizId} by admin user ${req.userId}:`, err);
        if (err.name === 'CastError') {
             return res.status(400).json({ error: 'Invalid Quiz ID format during query' });
        }
        res.status(500).json({ error: 'Failed to delete quiz', details: err.message });
    }
});

// GET /api/quiz/host/:id - Get quiz data for host view (Protected)
// Corrected arrow function syntax
router.get('/host/:id', protect, async (req, res) => {
    const quizId = req.params.id;
    console.log(`User ${req.userId} attempting to get host data for quiz ${quizId}`);
    try {
        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({ error: 'Invalid Quiz ID format' });
        }
        // Fetch the quiz, ensuring the requester is the creator
        // NOTE: If Admins should also be able to host any quiz, this logic needs adjustment
        const quiz = await Quiz.findOne({ _id: quizId, createdBy: req.userId });
        // If not found (either doesn't exist or user doesn't own it)
        if (!quiz) {
             // Check if it exists at all to give a different error
             const exists = await Quiz.findById(quizId).select('_id');
             if (exists) {
                 console.warn(`Host access denied for user ${req.userId} on quiz ${quizId} (not owner)`);
                 return res.status(403).json({ error: 'Forbidden: You do not own this quiz' });
             } else {
                 console.warn(`Host access failed: Quiz ${quizId} not found`);
                 return res.status(404).json({ error: 'Quiz not found' });
             }
        }
        console.log(`Host data retrieved for quiz ${quizId} by owner ${req.userId}`);
        // Send full quiz data (including answers) for the host
        res.status(200).json(quiz);
    } catch (err) {
        console.error(`Error fetching host data for quiz ${quizId}:`, err);
        res.status(500).json({ error: 'Failed to fetch quiz data for hosting', details: err.message });
    }
});

// POST /api/quiz/join - Join a quiz (Public or Protected)
// Example placeholder - Corrected arrow function syntax
// router.post('/join', async (req, res) => { /* ... */ });

// POST /api/quiz/submit/:quizId - Submit answer (Protected)
// Example placeholder - Corrected arrow function syntax
// router.post('/submit/:quizId', protect, async (req, res) => { /* ... */ });


module.exports = router;
