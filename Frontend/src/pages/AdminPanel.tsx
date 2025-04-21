// d:\Project\shivraj Comapny pr\GlobentPro\Frontend\src\pages\AdminPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Adjust path if needed
import Footer from '../components/Footer'; // Adjust path if needed

// Interface for the quiz data expected from /my-quizzes
interface AdminQuiz {
  id: string; // Use id consistently in frontend (mapped from _id)
  _id: string; // Keep original _id from backend
  title: string;
  pin: string;
  createdAt: string;
  questions: any[]; // Keep simple for listing
}

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminPanel: React.FC = () => {
  const [adminQuizzes, setAdminQuizzes] = useState<AdminQuiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get username from localStorage on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
  }, []);

  // Function to get token
  const getToken = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication required. Please log in as an admin.');
      // Optional: Redirect if not authenticated
      // navigate('/login');
      return null;
    }
    return token;
  }, [navigate]); // Add navigate if redirecting

  // Fetch quizzes created by the logged-in admin
  useEffect(() => {
    const fetchAdminQuizzes = async () => {
      setLoading(true);
      setError(null);
      setDeleteError(null);

      const token = getToken();
      if (!token) {
        setLoading(false);
        return; // Stop if no token
      }

      try {
        console.log(`ADMIN PANEL: Fetching quizzes from ${API_URL}/api/quiz/my-quizzes`);
        const response = await axios.get<AdminQuiz[]>(`${API_URL}/api/quiz/my-quizzes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const quizzesData = response.data.map((quiz) => ({
          ...quiz,
          id: quiz._id,
        }));

        setAdminQuizzes(quizzesData);
        console.log(`ADMIN PANEL: Fetched ${quizzesData.length} quizzes`);

      } catch (err) {
        const error = err as AxiosError<{ error?: string, details?: string }>;
        console.error("ADMIN PANEL: Error fetching admin's quizzes:", error);
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            setError('Unauthorized: Could not fetch admin quizzes. Please log in again with admin credentials.');
          } else {
             const backendError = error.response.data?.error || `Server error (${error.response.status})`;
             setError(`Failed to load admin quizzes: ${backendError}`);
          }
        } else if (error.request) {
          setError('Failed to load admin quizzes. No response from server.');
        } else {
          setError(`Failed to load admin quizzes. Error: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminQuizzes();
  }, [getToken]);

  // Handle deleting a quiz (Admin Action)
  const handleDelete = async (quizId: string, quizTitle: string) => {
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
      console.log(`ADMIN PANEL: Attempting to delete quiz ${quizId}`);
      await axios.delete(`${API_URL}/api/quiz/${quizId}`, { // Use the original _id
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the quiz from the local state
      setAdminQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
      console.log(`ADMIN PANEL: Quiz ${quizId} deleted successfully.`);

    } catch (err) {
        const error = err as AxiosError<{ error?: string, details?: string }>;
        console.error(`ADMIN PANEL: Error deleting quiz ${quizId}:`, error);
        let specificError = 'Failed to delete quiz.';
        if (error.response) {
            const backendError = error.response.data?.error || `Server error (${error.response.status})`;
            // Backend's isAdmin middleware handles the 403 Forbidden case
            specificError = backendError;
        } else if (error.request) {
            specificError = 'No response from server during delete request.';
        } else {
            specificError = `Error: ${error.message}`;
        }
        setDeleteError(specificError);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
        <h2 className="text-xl text-gray-600 mb-6">Welcome, {username || 'Admin'}!</h2>

        {/* Placeholder for other admin actions */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">Admin Tools</h3>
            <div className="flex gap-4">
                <Link to="/create" className="text-blue-600 hover:underline">Create New Quiz</Link>
                {/* Add links to user management, site settings etc. when implemented */}
                {/* <Link to="/admin/users" className="text-blue-600 hover:underline">Manage Users</Link> */}
            </div>
        </div>


        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Your Created Quizzes</h3>

        {/* Loading/Error States */}
        {loading && <div className="text-center py-4">Loading your quizzes...</div>}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {deleteError && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Delete Failed: </strong>
            <span className="block sm:inline">{deleteError}</span>
            <button onClick={() => setDeleteError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close delete error">
              <svg className="fill-current h-6 w-6 text-orange-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
          </div>
        )}

        {/* Quiz Table */}
        {!loading && !error && adminQuizzes.length === 0 && (
          <div className="text-center text-gray-600 py-8 bg-white rounded shadow p-6">
            You haven't created any quizzes yet.
            <Link
              to="/create"
              className="ml-4 inline-block px-4 py-2 bg-[#BFD732] text-white rounded hover:bg-[#a8bd2b] transition-colors"
            >
              Create One Now
            </Link>
          </div>
        )}

        {!loading && !error && adminQuizzes.length > 0 && (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PIN</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adminQuizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 font-mono">
                        {quiz.pin}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quiz.questions?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Delete button is always visible here, backend handles authorization */}
                      <button
                        onClick={() => handleDelete(quiz._id, quiz.title)} // Calls the delete handler with original _id
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Quiz"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminPanel;
