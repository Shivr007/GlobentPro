// d:\Project\shivraj Comapny pr\GlobentPro\Frontend\src\pages\MyQuizzes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Adjust path if needed
import Footer from '../components/Footer'; // Adjust path if needed

// Interface for the quiz data
interface Quiz {
  id: string; // Use id consistently in frontend (mapped from _id)
  _id: string; // Keep original _id from backend
  title: string;
  pin: string;
  createdAt: string;
  questions: any[]; // Keep simple for listing
  description?: string;
  // owner?: string; // If needed later
}

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyQuizzes: React.FC = () => { // Fixed =>
  const [quizzes, setQuizzes] = useState<Quiz[]>([]); // Fixed <>
  const [loading, setLoading] = useState<boolean>(true); // Fixed <>
  const [error, setError] = useState<string | null>(null); // Fixed <>
  const [deleteError, setDeleteError] = useState<string | null>(null); // Fixed <>
  const [isAdminView, setIsAdminView] = useState<boolean | null>(null); // Use null initial state
  const navigate = useNavigate();

  // Check admin status based on stored email (for UI/fetch logic)
  useEffect(() => { // Fixed =>
    const userEmail = localStorage.getItem('userEmail');
    const authToken = localStorage.getItem('authToken');
    if (authToken && userEmail && userEmail.toLowerCase().endsWith('@globant.com')) {
      console.log("MyQuizzes: Admin view enabled based on email:", userEmail);
      setIsAdminView(true);
    } else {
      setIsAdminView(false);
    }
  }, []);

  // Function to get token
  const getToken = useCallback(() => { // Fixed =>
    const token = localStorage.getItem('authToken');
    return token;
  }, []);

  // Fetch quizzes based on user role (admin fetches all, user fetches own)
  useEffect(() => { // Fixed =>
    // Only run fetch after isAdminView state has been determined
    if (isAdminView === null) {
        return; // Wait for admin check effect to run
    }

    const fetchQuizzes = async () => { // Fixed =>
      setLoading(true);
      setError(null);
      setDeleteError(null);

      const token = getToken();
      if (!token && !isAdminView) {
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
      }

      const endpoint = isAdminView ? `${API_URL}/api/quiz/all` : `${API_URL}/api/quiz/my-quizzes`;
      const fetchDesc = isAdminView ? "all quizzes (admin view)" : "user's quizzes";

      try {
        console.log(`Fetching ${fetchDesc} from ${endpoint}`);
        const headers: { Authorization?: string } = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.get<Quiz[]>(endpoint, { headers }); // Fixed <>

        const quizzesData = response.data.map((quiz) => ({ // Fixed =>
          ...quiz,
          id: quiz._id,
          questions: quiz.questions || [],
        }));

        setQuizzes(quizzesData);
        console.log(`Fetched ${quizzesData.length} ${fetchDesc}`);

      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string, message?: string, details?: string }>; // Fixed <>
        console.error(`Error fetching ${fetchDesc}:`, axiosError);
        let message = `Failed to load ${fetchDesc}.`;

        if (axiosError.response) {
          const backendError = axiosError.response.data?.error || axiosError.response.data?.message || `Server error (${axiosError.response.status})`; // Check message too
          if (axiosError.response.status === 401 || axiosError.response.status === 403) {
            message = `Unauthorized: ${backendError}. Your session might have expired. Please log in again.`;
          } else {
             message = `Failed to load quizzes: ${backendError}`;
          }
          console.error("Error Response Data:", axiosError.response.data);
        } else if (axiosError.request) {
          message = `Failed to load quizzes. No response from server. Is the backend running?`;
        } else {
          message = `Failed to load quizzes. Error: ${axiosError.message}`;
        }
        setError(message);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();

  }, [isAdminView, getToken]); // Re-fetch if admin status changes

  // Handle deleting a quiz
  const handleDelete = async (quizId: string, quizTitle: string) => { // Fixed =>
    const confirmationMessage = isAdminView
      ? `ADMIN ACTION: Are you sure you want to delete the quiz "${quizTitle}"? This action cannot be undone.`
      : `Are you sure you want to delete your quiz "${quizTitle}"? This action cannot be undone.`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setDeleteError(null);
    const token = getToken();
    if (!token) {
        setDeleteError('Authentication error. Please log in again.');
        return;
    }

    try {
      console.log(`Attempting delete for quiz ${quizId} (User is admin: ${isAdminView})`);
      await axios.delete(`${API_URL}/api/quiz/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId)); // Fixed => =>
      console.log(`Quiz ${quizId} deleted successfully from frontend state.`);

    } catch (err) {
        const axiosError = err as AxiosError<{ error?: string, message?: string, details?: string }>; // Fixed <>
        console.error(`Error deleting quiz ${quizId}:`, axiosError);
        let specificError = 'Failed to delete quiz.';
        if (axiosError.response) {
            const backendError = axiosError.response.data?.error || axiosError.response.data?.message || `Server error (${axiosError.response.status})`; // Check message too
            if (axiosError.response.status === 401) {
                specificError = 'Unauthorized. Please log in again.';
            } else if (axiosError.response.status === 403) {
                specificError = backendError;
            } else if (axiosError.response.status === 404) {
                specificError = 'Quiz not found on the server.';
            } else {
                specificError = backendError;
            }
            console.error("Delete Error Response Data:", axiosError.response.data);
        } else if (axiosError.request) {
            specificError = 'No response from server during delete request.';
        } else {
            specificError = `Error: ${axiosError.message}`;
        }
        setDeleteError(specificError);
    }
  };

  // --- JSX Rendering ---
  return (
    <div className="flex min-h-screen flex-col bg-gray-100"> {/* Fixed <> */}
      <Navbar /> {/* Fixed </> */}

      <main className="flex-grow container mx-auto px-4 py-8"> {/* Fixed <> */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6"> {/* Fixed <> */}
            {isAdminView ? 'All Quizzes (Admin View)' : 'My Created Quizzes'}
        </h1> {/* Fixed </> */}

        {/* Loading/Error States */}
        {loading && <div className="text-center py-4">Loading quizzes...</div>} {/* Fixed <> </> */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"> {/* Fixed <> */}
            <strong className="font-bold">Error: </strong> {/* Fixed <> </> */}
            <span className="block sm:inline">{error}</span> {/* Fixed <> </> */}
          </div> // Fixed </>
        )}
        {deleteError && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded relative mb-4" role="alert"> {/* Fixed <> */}
            <strong className="font-bold">Delete Failed: </strong> {/* Fixed <> </> */}
            <span className="block sm:inline">{deleteError}</span> {/* Fixed <> </> */}
            <button onClick={() => setDeleteError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close delete error"> {/* Fixed => <> */}
              <svg className="fill-current h-6 w-6 text-orange-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg> {/* Fixed <> </> </> */}
            </button> {/* Fixed </> */}
          </div> // Fixed </>
        )}

        {/* Quiz Table */}
        {!loading && !error && quizzes.length === 0 && (
          <div className="text-center text-gray-600 py-8 bg-white rounded shadow p-6"> {/* Fixed <> */}
            {isAdminView ? 'No quizzes found in the system.' : "You haven't created any quizzes yet."}
            <Link
              to="/create"
              className="ml-4 inline-block px-4 py-2 bg-[#BFD732] text-white rounded hover:bg-[#a8bd2b] transition-colors"
            >
              Create One Now
            </Link> {/* Fixed </> */}
          </div> // Fixed </>
        )}

        {!loading && !error && quizzes.length > 0 && ( // Fixed >
          <div className="overflow-x-auto bg-white rounded shadow"> {/* Fixed <> */}
            <table className="min-w-full divide-y divide-gray-200"> {/* Fixed <> */}
              <thead className="bg-gray-50"> {/* Fixed <> */}
                <tr> {/* Fixed <> */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th> {/* Fixed <> </> */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PIN</th> {/* Fixed <> </> */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th> {/* Fixed <> </> */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th> {/* Fixed <> </> */}
                  {/* {isAdminView && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>} */}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> {/* Fixed <> </> */}
                </tr> {/* Fixed </> */}
              </thead> {/* Fixed </> */}
              <tbody className="bg-white divide-y divide-gray-200"> {/* Fixed <> */}
                {quizzes.map((quiz) => ( // Fixed =>
                  <tr key={quiz.id}> {/* Fixed <> */}
                    <td className="px-6 py-4 whitespace-nowrap"> {/* Fixed <> */}
                      <div className="text-sm font-medium text-gray-900">{quiz.title}</div> {/* Fixed <> </> */}
                      {isAdminView && quiz.description && <div className="text-xs text-gray-500">{quiz.description}</div>} {/* Fixed <> </> */}
                    </td> {/* Fixed </> */}
                    <td className="px-6 py-4 whitespace-nowrap"> {/* Fixed <> */}
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 font-mono"> {/* Fixed <> */}
                        {quiz.pin}
                      </span> {/* Fixed </> */}
                    </td> {/* Fixed </> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {/* Fixed <> */}
                      {quiz.questions?.length || 0}
                    </td> {/* Fixed </> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {/* Fixed <> */}
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </td> {/* Fixed </> */}
                    {/* {isAdminView && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.owner || 'N/A'}</td>} */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"> {/* Fixed <> */}
                      <button
                        onClick={() => handleDelete(quiz._id, quiz.title)} // Fixed =>
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title={isAdminView ? "Delete Quiz (Admin)" : "Delete Quiz"}
                      >
                        Delete
                      </button> {/* Fixed </> */}
                       <Link
                         to={`/host/${quiz._id}`}
                         className="ml-4 text-indigo-600 hover:text-indigo-900 transition-colors"
                         title="Host Quiz"
                       >
                         Host
                       </Link> {/* Fixed </> */}
                    </td> {/* Fixed </> */}
                  </tr> // Fixed </>
                ))}
              </tbody> {/* Fixed </> */}
            </table> {/* Fixed </> */}
          </div> // Fixed </>
        )}
      </main> {/* Fixed </> */}

      <Footer /> {/* Fixed </> */}
    </div> // Fixed </>
  );
};

export default MyQuizzes;
