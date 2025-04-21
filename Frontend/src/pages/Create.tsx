// d:\Project\shivraj Comapny pr\GlobentPro\Frontend\src\pages\Create.tsx
import React, { useState, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import axios, { AxiosError } from 'axios'; // Import AxiosError
import Navbar from '../components/Navbar'; // Adjust path if needed
import Footer from '../components/Footer'; // Import Footer

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- Interfaces ---
interface Answer {
  id: string; // Frontend ID for React keys
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string; // Frontend ID for React keys
  text: string;
  timeLimit: number;
  points: number;
  answers: Answer[];
}

// Interface for the data structure sent to the backend (no frontend IDs)
interface BackendAnswer {
    text: string;
    isCorrect: boolean;
}

interface BackendQuestion {
    text: string;
    timeLimit: number;
    points: number;
    answers: BackendAnswer[];
}
// --- End Interfaces ---

const Create: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    // Initial question structure
    {
      id: nanoid(),
      text: '',
      timeLimit: 20,
      points: 100,
      answers: Array(4).fill(null).map(() => ({
        id: nanoid(),
        text: '',
        isCorrect: false
      }))
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Function to get token from localStorage ---
  const getToken = useCallback(() => {
    const token = localStorage.getItem('authToken');
    // console.log("Retrieved token from localStorage:", token ? `${token.substring(0,10)}...` : null); // Debug log
    return token;
  }, []);
  // --- End Function to get token ---

  // --- State Update Functions (No changes needed here) ---
  const addQuestion = () => {
    setQuestions(qs => [
      ...qs,
      {
        id: nanoid(), text: '', timeLimit: 20, points: 100,
        answers: Array(4).fill(null).map(() => ({ id: nanoid(), text: '', isCorrect: false }))
      }
    ]);
  };
  const updateQuestionText = (qid: string, text: string) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, text } : q));
  const updateAnswerText = (qid: string, aid: string, text: string) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, answers: q.answers.map(a => a.id === aid ? { ...a, text } : a) } : q));
  const toggleCorrectAnswer = (qid: string, aid: string) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, answers: q.answers.map(a => a.id === aid ? { ...a, isCorrect: !a.isCorrect } : a) } : q));
  const updateTimeLimit = (qid: string, tl: number) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, timeLimit: tl } : q));
  const deleteQuestion = (qid: string) => setQuestions(qs => qs.length > 1 ? qs.filter(q => q.id !== qid) : qs);
  // --- End State Update Functions ---

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // --- Validation ---
    if (!title.trim()) return setError('Title is required');
    if (questions.some(q => !q.text.trim())) return setError('All questions need text');
    // Ensure at least one answer has text if it's marked correct (prevents submitting empty correct answers)
    if (questions.some(q => q.answers.some(a => a.isCorrect && !a.text.trim()))) return setError('Correct answers cannot be empty');
    // Ensure at least one answer exists and is marked correct
    if (questions.some(q => q.answers.length === 0 || !q.answers.some(a => a.isCorrect))) return setError('Each question needs at least one correct answer');
    // --- End Validation ---

    // --- Get Authentication Token ---
    const token = getToken();
    if (!token) {
        setError('Authentication Error: You must be logged in to create a quiz. Please log in.');
        // Optionally redirect: navigate('/login');
        return; // Stop submission if no token
    }
    // --- End Get Authentication Token ---

    setLoading(true); // Start loading indicator

    try {
      // Prepare payload for backend (map frontend state to backend structure)
      const payload = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map(q => ({
          text: q.text.trim(), // Trim text
          timeLimit: q.timeLimit,
          points: q.points,
          // Filter out answers with no text unless they are the only answer (edge case)
          answers: q.answers
                     .filter(a => a.text.trim() || q.answers.length === 1)
                     .map(a => ({
                        text: a.text.trim(), // Trim text
                        isCorrect: a.isCorrect
                     }))
        })) as BackendQuestion[] // Type assertion for clarity
      };

      // Final check on payload structure before sending
      if (payload.questions.some(q => q.answers.length < 2)) {
          setError("Validation Error: Each question must have at least two non-empty answer options.");
          setLoading(false);
          return;
      }
       if (payload.questions.some(q => !q.answers.some(a => a.isCorrect))) {
          setError("Validation Error: Each question still needs a correct answer after filtering empty options.");
          setLoading(false);
          return;
      }


      console.log("Submitting quiz data:", JSON.stringify(payload, null, 2));
      console.log("Using token:", token ? `${token.substring(0, 10)}...` : 'No Token Found!');

      // *** Make the authenticated request with Authorization header ***
      const response = await axios.post<{ _id: string }>(
        `${API_URL}/api/quiz/create`, // Use API_URL constant
        payload,                      // Send the cleaned payload
        {
          headers: {
            // Include the token in the Authorization header
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // *** End authenticated request ***

      const newQuizId = response.data._id;
      console.log("Quiz created successfully with ID:", newQuizId);

      // Navigate to the host page for the newly created quiz
      navigate(`/host/${newQuizId}`);

    } catch (err) {
      // --- Improved Error Handling ---
      const axiosError = err as AxiosError<{ error?: string, message?: string, detail?: string, details?: string }>;
      console.error("Error creating quiz:", axiosError); // Log the full error object

      let message = 'Failed to save quiz. An unknown error occurred.'; // Default error message

      if (axiosError.response) {
        // Log details if the server responded with an error
        console.error("Create Error Response Status:", axiosError.response.status);
        // Log the actual data from the backend response
        console.error("Create Error Response Data:", JSON.stringify(axiosError.response.data, null, 2));

        // Try to extract a meaningful message from common backend error response formats
        const backendMsg = axiosError.response.data?.error
                        || axiosError.response.data?.message
                        || axiosError.response.data?.detail
                        || axiosError.response.data?.details
                        || (typeof axiosError.response.data === 'string' ? axiosError.response.data : null);

        const status = axiosError.response.status;

        // Provide specific feedback based on status code
        if (status === 401) { // Unauthorized
          message = `Authentication Failed (401): Your session might be invalid or expired. Please log out and log back in. ${backendMsg ? `(${backendMsg})` : ''}`;
        } else if (status === 403) { // Forbidden
          message = `Forbidden (403): You may not have permission to perform this action. ${backendMsg ? `(${backendMsg})` : ''}`;
        } else if (status === 400) { // Bad Request (e.g., validation failed on backend)
           message = `Bad Request (400): Please check your input data. ${backendMsg ? `(${backendMsg})` : ''}`;
        } else { // Other server errors (5xx)
          message = `Server Error (${status}): ${backendMsg || 'Could not complete the request.'}`;
        }
      } else if (axiosError.request) {
        // Error occurred setting up the request or no response received
        message = 'Network Error: Could not connect to the server. Please check your connection and ensure the backend is running.';
        console.error("Create Error Request Data:", axiosError.request);
      } else {
        // Other errors (e.g., JavaScript error before request was sent)
        message = `Client Error: ${axiosError.message}`;
      }
      // --- End Improved Error Handling ---
      setError(message); // Set the error state to display the message in the UI
    } finally {
      setLoading(false); // Stop loading indicator regardless of success or failure
    }
  };
  // --- End Form Submission Handler ---

  // --- JSX Rendering ---
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Navbar />
      <main className="flex-1 p-4 md:p-6">
        {/* Form Container */}
        <div className="mx-auto max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <h1 className="mb-6 text-2xl md:text-3xl font-bold text-gray-800">Create a New Quiz</h1>

          {/* Error Display Area */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
                <span className="font-medium">Error:</span> {error}
            </div>
          )}

          {/* Quiz Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Title Input */}
            <div>
              <label htmlFor="quizTitle" className="block mb-1 font-semibold text-gray-700">Title</label>
              <input
                id="quizTitle"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#BFD732] focus:ring-1 focus:ring-[#BFD732] transition"
                placeholder="Enter quiz title"
                required
                disabled={loading} // Disable input when loading
              />
            </div>

            {/* Quiz Description Input */}
            <div>
              <label htmlFor="quizDescription" className="block mb-1 font-semibold text-gray-700">Description (Optional)</label>
              <textarea
                id="quizDescription"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#BFD732] focus:ring-1 focus:ring-[#BFD732] transition"
                rows={3}
                placeholder="Describe your quiz"
                disabled={loading} // Disable input when loading
              />
            </div>

            <hr className="my-6"/>

            {/* Questions Section Header */}
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Questions</h2>

            {/* Map through questions state */}
            {questions.map((q, i) => (
              <div key={q.id} className="mb-6 border border-gray-200 p-4 rounded-md bg-gray-50 space-y-4"> {/* Added space-y */}
                {/* Question Header (Number and Delete Button) */}
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-gray-800">Question {i+1}</h3>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(q.id)}
                    // Disable delete if only one question or loading
                    disabled={questions.length === 1 || loading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  >
                    Delete Question
                  </button>
                </div>

                {/* Question Text Input */}
                <div>
                    <label htmlFor={`qtext-${q.id}`} className="sr-only">Question Text</label>
                    <input
                        id={`qtext-${q.id}`}
                        type="text"
                        value={q.text}
                        onChange={e => updateQuestionText(q.id, e.target.value)}
                        placeholder="Enter your question here..."
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#BFD732] focus:ring-1 focus:ring-[#BFD732] transition"
                        required
                        disabled={loading}
                    />
                </div>

                {/* Time Limit Slider */}
                <div>
                  <label htmlFor={`time-${q.id}`} className="block mb-1 text-sm font-medium text-gray-600">Time limit: {q.timeLimit} seconds</label>
                  <input
                    id={`time-${q.id}`}
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={q.timeLimit}
                    onChange={e => updateTimeLimit(q.id, +e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#BFD732]"
                    disabled={loading}
                  />
                </div>

                {/* Answers Section */}
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Answers</h4>
                  {/* Grid layout for answers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.answers.map((a, ai) => (
                      <div key={a.id} className="flex items-center bg-white p-2 border border-gray-200 rounded">
                        {/* Answer Text Input */}
                        <label htmlFor={`answer-${a.id}`} className="sr-only">Answer {ai+1}</label>
                        <input
                          id={`answer-${a.id}`}
                          type="text"
                          value={a.text}
                          onChange={e => updateAnswerText(q.id, a.id, e.target.value)}
                          placeholder={`Answer ${ai+1}`}
                          className="flex-1 border-none px-2 py-1 focus:ring-0 text-sm"
                          // Require text only if marked as correct
                          required={a.isCorrect}
                          disabled={loading}
                        />
                        {/* Correct Answer Checkbox */}
                        <label htmlFor={`correct-${a.id}`} className="flex items-center ml-2 cursor-pointer text-sm text-gray-600 whitespace-nowrap">
                          <input
                            id={`correct-${a.id}`}
                            type="checkbox"
                            checked={a.isCorrect}
                            onChange={() => toggleCorrectAnswer(q.id, a.id)}
                            className="mr-1 h-4 w-4 rounded border-gray-300 text-[#BFD732] focus:ring-[#a8bd2b]"
                            disabled={loading}
                          />
                          Correct
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {/* End map through questions */}

            {/* Add Question Button */}
            <button
              type="button"
              onClick={addQuestion}
              disabled={loading}
              className="w-full rounded border-2 border-dashed border-gray-300 px-4 py-2 text-gray-600 hover:border-[#BFD732] hover:text-[#BFD732] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Question
            </button>

            <hr className="my-6"/>

            {/* Submit Button */}
            <div className="text-right">
              <button
                type="submit"
                disabled={loading} // Disable button when loading
                className="rounded bg-[#BFD732] px-6 py-2 text-white font-semibold hover:bg-[#a8bd2b] focus:outline-none focus:ring-2 focus:ring-[#BFD732] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {/* Change button text based on loading state */}
                {loading ? 'Creating Quiz...' : 'Create Quiz'}
              </button>
            </div>
          </form>
          {/* End Quiz Form */}
        </div>
        {/* End Form Container */}
      </main>
      <Footer /> {/* Render Footer */}
    </div>
  );
  // --- End JSX Rendering ---
};

export default Create;
