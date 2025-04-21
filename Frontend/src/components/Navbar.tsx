// d:\Project\shivraj Comapny pr\GlobentPro\Frontend\src\components\Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosError } from 'axios';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Interface for quiz data used in search dropdown
interface QuizSearchItem {
  _id: string;
  title: string;
}

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [allQuizzes, setAllQuizzes] = useState<QuizSearchItem[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Check login and admin status on mount
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      setIsLoggedIn(true);
      // Determine admin status based on email IF logged in
      // This uses the frontend check based on email domain
      setIsAdmin(!!userEmail && userEmail.toLowerCase().endsWith('@globant.com'));
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, []);

  // Fetch quizzes for search (simplified fetch logic)
  const fetchQuizzesForSearch = useCallback(async () => {
    if (allQuizzes.length > 0 && !searchQuery) {
        setFilteredQuizzes(allQuizzes);
        return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const response = await axios.get<QuizSearchItem[]>(`${API_URL}/api/quiz/all`);
      setAllQuizzes(response.data);
      const currentQuery = searchQuery.toLowerCase();
      const initialFiltered = response.data.filter(quiz =>
          quiz.title.toLowerCase().includes(currentQuery)
      );
      setFilteredQuizzes(initialFiltered);
    } catch (err) {
      console.error("Navbar: Error fetching quizzes for search:", err);
      setSearchError("Failed to load quizzes.");
      setAllQuizzes([]);
      setFilteredQuizzes([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, allQuizzes.length]);

  // Trigger fetch when search opens
  useEffect(() => {
    if (showSearch) {
      fetchQuizzesForSearch();
    }
  }, [showSearch, fetchQuizzesForSearch]);

  // Client-side filtering effect
  useEffect(() => {
    if (!searchQuery) {
      setFilteredQuizzes(allQuizzes);
      return;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = allQuizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredQuizzes(filtered);
  }, [searchQuery, allQuizzes]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };
    if (showSearch) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left Side */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-[rgb(191,215,50)] flex-shrink-0">
            <img
              src="/assets/logo_variations/Globant-Black.svg"
              alt="Globant Logo"
              className="h-10"
            />
          </Link>
          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)] transition-colors">
              Home
            </Link>

            {/* --- Links shown when logged in --- */}
            {isLoggedIn && (
              <>
                <Link to="/my-quizzes" className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)] transition-colors">
                  My Quizzes
                </Link>
                <Link to="/profile" className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)] transition-colors">
                  Profile
                </Link>
                {/* *** CREATE LINK: Only show if ADMIN *** */}
                {/* Condition uses isAdmin */}
                {isAdmin && (
                  <Link to="/create" className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)] transition-colors">
                    Create
                  </Link>
                )}
                {/* ************************************ */}
              </>
            )}
            {/* --- End logged in links --- */}

            {/* Admin Panel link */}
            {isAdmin && (
                 <Link to="/admin" className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)] transition-colors">
                    Admin Panel
                 </Link>
            )}

            {/* Discover/Search Dropdown */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setShowSearch(prev => !prev)}
                className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)] flex items-center transition-colors"
                aria-haspopup="true"
                aria-expanded={showSearch}
              >
                Discover
                <svg className={`w-4 h-4 ml-1 transition-transform ${showSearch ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {showSearch && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl p-4 z-50 border border-gray-200">
                  <input
                    type="text"
                    placeholder="Search quizzes by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(191,215,50)] mb-2"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {searchLoading && <div className="text-gray-500 text-sm p-2">Loading...</div>}
                    {searchError && <div className="text-red-500 text-sm p-2">{searchError}</div>}
                    {!searchLoading && !searchError && filteredQuizzes.length === 0 && (
                      <div className="text-gray-500 text-sm p-2">
                        {allQuizzes.length === 0 ? 'No quizzes found.' : 'No matches found.'}
                      </div>
                    )}
                    {!searchLoading && !searchError && filteredQuizzes.map(quiz => (
                      <Link
                        key={quiz._id}
                        to={`/play/${quiz._id}`}
                        onClick={() => setShowSearch(false)}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md truncate"
                        title={quiz.title}
                      >
                        {quiz.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Side: Auth Buttons */}
        <div className="flex items-center space-x-4">
          {/* Create Button (visible on smaller screens if ADMIN) */}
          {/* *** Only show if ADMIN *** */}
          {/* Condition uses isAdmin */}
          {isAdmin && (
            <Link
              to="/create"
              className="bg-[rgb(191,215,50)] text-white px-4 py-2 rounded-md font-bold hover:bg-[#a8bd2b] transition-all md:hidden"
            >
              Create
            </Link>
          )}
          {/* ************************* */}

          {/* Login/Signup or Logout */}
          {!isLoggedIn ? (
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link
                to="/login"
                className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-[rgb(191,215,50)] text-white px-4 py-2 rounded-md font-bold hover:bg-[#a8bd2b] transition-all"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)] transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
