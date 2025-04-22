// d:\Project\shivraj Comapny pr\GlobentPro\Frontend\src\pages\User.tsx
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Navbar from '../components/Navbar'; // Adjust path if needed
import Footer from '../components/Footer'; // Adjust path if needed

// Interface adjusted for potential backend response (_id)
interface Quiz {
  id: string; // Use id consistently in frontend for React keys etc.
  _id: string; // Keep original _id from backend for API calls
  title: string;
  description: string;
  createdAt: string; // Assuming backend provides this
  questions: any[]; // Keep questions structure simple for listing
  pin?: string; // Add pin if backend sends it in /all response
}

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const User = () => {
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isAdminUI, setIsAdminUI] = useState(false);

  // Check admin status based on stored email (for UI purposes only)
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const authToken = localStorage.getItem('authToken');
    if (authToken && userEmail && userEmail.toLowerCase().endsWith('@globant.com')) {
      console.log("User Page: Admin UI enabled based on email:", userEmail);
      setIsAdminUI(true);
    } else {
      setIsAdminUI(false);
    }
  }, []);

  // Function to get token
  const getToken = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return token;
  }, []);

  // Fetch all quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);
      setDeleteError(null);
      try {
        console.log(`User Page: Fetching quizzes from ${API_URL}/api/quiz/all`);
        // Ensure the backend response for /all includes the 'pin' field
        const response = await axios.get<Quiz[]>(`${API_URL}/api/quiz/all`);

        const quizzesFromApi: Quiz[] = response.data.map((quiz) => ({
          ...quiz,
          id: quiz._id, // Map _id to id for React keys/frontend logic
          questions: quiz.questions || [],
          pin: quiz.pin // Ensure pin is included
        }));

        setAvailableQuizzes(quizzesFromApi);
        setFilteredQuizzes(quizzesFromApi); // Initialize filtered list
        console.log(`User Page: Fetched ${quizzesFromApi.length} quizzes`);
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string, details?: string }>;
        console.error("User Page: Error fetching quizzes:", axiosError);
        let message = "Failed to load quizzes. Please try again later.";
        if (axiosError.response) {
          message = `Failed to load quizzes. Server responded with status ${axiosError.response.status}. Check backend logs.`;
        } else if (axiosError.request) {
          message = "Failed to load quizzes. No response from server. Is the backend running?";
        } else {
          message = `Failed to load quizzes. Error: ${axiosError.message}`;
        }
        setError(message);
        setAvailableQuizzes([]);
        setFilteredQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []); // Fetch only once on component mount

  // Filter logic - runs when search query or the base list of quizzes changes
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = availableQuizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(lowerCaseQuery) ||
      (quiz.description && quiz.description.toLowerCase().includes(lowerCaseQuery)) ||
      (quiz.pin && quiz.pin.toLowerCase().includes(lowerCaseQuery)) // Allow searching by PIN too
    );
    setFilteredQuizzes(filtered);
  }, [searchQuery, availableQuizzes]);

  // --- Handle Deleting a Quiz (Admin Action) ---
  const handleDelete = async (quizId: string, quizTitle: string) => {
    if (!isAdminUI) {
        console.warn("Delete attempt blocked by UI check (isAdminUI is false)");
        return;
    }
    if (!window.confirm(`ADMIN ACTION: Are you sure you want to delete the quiz "${quizTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteError(null);
    const token = getToken();
    if (!token) {
        setDeleteError('Authentication error. Please log in again.');
        return;
    }

    try {
      console.log(`User Page: Attempting admin delete for quiz ${quizId}`);
      await axios.delete(`${API_URL}/api/quiz/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAvailableQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz._id !== quizId));
      console.log(`User Page: Quiz ${quizId} deleted successfully by admin.`);

    } catch (err) {
        const axiosError = err as AxiosError<{ error?: string, message?: string, detail?: string, details?: string }>;
        console.error(`User Page: Error deleting quiz ${quizId}:`, axiosError);
        let specificError = 'Failed to delete quiz. An unknown error occurred.';
        if (axiosError.response) {
            const backendMsg = axiosError.response.data?.error || axiosError.response.data?.message || axiosError.response.data?.detail || axiosError.response.data?.details || (typeof axiosError.response.data === 'string' ? axiosError.response.data : null);
            const status = axiosError.response.status;
            if (status === 401) specificError = `Unauthorized (401): Please log in again. ${backendMsg ? `(${backendMsg})` : ''}`;
            else if (status === 403) specificError = `Forbidden (403): You may not have permission. ${backendMsg ? `(${backendMsg})` : ''}`;
            else if (status === 404) specificError = `Not Found (404): The quiz may have already been deleted. ${backendMsg ? `(${backendMsg})` : ''}`;
            else specificError = `Server Error (${status}): ${backendMsg || 'Could not complete the request.'}`;
        } else if (axiosError.request) {
            specificError = 'Network Error: Could not connect to the server.';
        } else {
            specificError = `Client Error: ${axiosError.message}`;
        }
        setDeleteError(specificError);
    }
  };
  // --- End Handle Delete ---

  // --- JSX Rendering ---
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50">
      <Navbar hideMyQuizzes={true} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[rgb(191,215,50)] to-[rgb(171,195,30)] py-16 px-4 transform transition-all duration-500 hover:scale-[1.02]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-down">Welcome to GlobQuiz!</h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in-up">Test your knowledge and learn something new</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/join')}
              className="bg-white text-[rgb(191,215,50)] px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 animate-bounce-in"
            >
              Join a Quiz by PIN
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-gradient-to-b from-transparent to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white hover:to-gray-50">
              <h2 className="text-2xl font-bold text-[#BFD732] mb-4 animate-fade-in">Learn</h2>
              <p className="text-gray-700 mb-6">Engage in interactive quizzes and enhance your knowledge.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white hover:to-gray-50">
              <h2 className="text-2xl font-bold text-[#BFD732] mb-4 animate-fade-in">Practice</h2>
              <p className="text-gray-700 mb-6">Test your understanding with various quiz topics.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white hover:to-gray-50">
              <h2 className="text-2xl font-bold text-[#BFD732] mb-4 animate-fade-in">Compete</h2>
              <p className="text-gray-700 mb-6">Challenge yourself and track your progress.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Quizzes Section */}
      <div className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#BFD732] mb-8 text-center animate-fade-in">Available Quizzes</h2>
          <div className="mb-8 max-w-md mx-auto">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search quizzes by title, description, or PIN..." // Updated placeholder
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#BFD732] focus:outline-none transition-colors"
              />
              <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Loading/Error States */}
          {loading && <div className="text-center py-8 text-gray-600">Loading quizzes...</div>}
          {error && <div className="text-center py-8 text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}
          {deleteError && (
            <div className="text-center py-2 text-orange-700 bg-orange-100 p-3 rounded-lg mb-4 max-w-xl mx-auto" role="alert">
                <strong>Delete Failed:</strong> {deleteError}
                <button onClick={() => setDeleteError(null)} className="ml-4 text-orange-900 font-bold">X</button>
            </div>
          )}

          {/* Quiz List */}
          {!loading && !error && filteredQuizzes.length === 0 && (
            <div className="text-center py-8 animate-fade-in-up">
              <p className="text-gray-600 text-lg mb-4">
                {availableQuizzes.length === 0
                  ? "No quizzes are available at the moment."
                  : "No quizzes match your search."}
              </p>
            </div>
          )}

          {!loading && !error && filteredQuizzes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz, index) => (
                <div
                  key={quiz.id} // Use the mapped id for React key
                  className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up flex flex-col justify-between"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Quiz Info */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                    <p className="text-gray-600 mb-2 text-sm line-clamp-2 h-10">{quiz.description || 'No description available.'}</p>
                    <p className="text-xs text-gray-500 mb-1">
                      {quiz.questions?.length || 0} question{quiz.questions?.length !== 1 ? 's' : ''}
                    </p>
                    {quiz.pin && ( // Display PIN if available
                        <p className="text-xs text-gray-500 mb-3">
                            PIN: <span className="font-mono font-semibold text-green-700">{quiz.pin}</span>
                        </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    {/* *** FIX: Navigate using quiz.pin *** */}
                    <button
                      onClick={() => {
                          if (quiz.pin) {
                              navigate(`/play/${quiz.pin}`); // Use PIN for navigation
                          } else {
                              console.error("Cannot navigate: Quiz PIN is missing for quiz:", quiz.title);
                              // Optionally show an error to the user or disable button
                          }
                      }}
                      disabled={!quiz.pin} // Disable button if no PIN is available
                      className="flex-1 bg-gradient-to-r from-[#BFD732] to-[rgb(171,195,30)] text-white px-4 py-2 rounded-md font-bold shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Take Quiz
                    </button>

                    {/* Conditional Delete Button */}
                    {isAdminUI && (
                      <button
                        onClick={() => handleDelete(quiz._id, quiz.title)} // Use original _id for API call
                        className="flex-none border border-red-500 text-red-500 px-3 py-2 rounded-md hover:bg-red-50 transition-colors text-sm"
                        title="Delete Quiz (Admin)"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default User;
