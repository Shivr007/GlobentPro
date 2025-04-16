import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setIsLoggedIn(true);
      setIsAdmin(userEmail.endsWith('@globant.com'));
    }
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    setQuizzes(savedQuizzes);
    setFilteredQuizzes(savedQuizzes);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = '/login';  // Return to login page
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-[rgb(191,215,50)]">
            <img
              src="../assets/logo_variations/Globant-Black.svg"
              alt="Globant Logo"
              className="h-10"
            />
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)]">
              Home
            </Link>
            {isAdmin && (
              <Link to="/create" className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)]">
                Create
              </Link>
            )}
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)] flex items-center"
              >
                Discover
              </button>
              {showSearch && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
                  <input
                    type="text"
                    placeholder="Search quizzes..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      const filtered = quizzes.filter(quiz =>
                        quiz.title.toLowerCase().includes(e.target.value.toLowerCase())
                      );
                      setFilteredQuizzes(filtered);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(191,215,50)]"
                  />
                  <div className="mt-2 max-h-48 overflow-y-auto">
                    {filteredQuizzes.map(quiz => (
                      <Link
                        key={quiz.id}
                        to={`/play/${quiz.id}`}
                        className="block px-3 py-2 hover:bg-gray-100 rounded-md"
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
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Link
              to="/create"
              className="bg-white border border-[rgb(191,215,50)] text-[rgb(191,215,50)] px-4 py-2 rounded-md font-bold hover:bg-[rgb(191,215,50)] hover:text-white transition-all hidden md:block"
            >
              Create
            </Link>
          )}
          {!isLoggedIn ? (
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)]"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)]"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="text-gray-700 font-semibold hover:text-[rgb(191,215,50)]"
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
