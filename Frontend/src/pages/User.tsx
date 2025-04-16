import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  questions: any[];
}

const User = () => {
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    // In a real application, this would fetch quizzes from an API
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    setAvailableQuizzes(quizzes);
    setFilteredQuizzes(quizzes);
  }, []);

  useEffect(() => {
    const filtered = availableQuizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQuizzes(filtered);
  }, [searchQuery, availableQuizzes]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50">
      <Navbar />

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
              Join a Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-gradient-to-b from-transparent to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            <div className="relative">
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#BFD732] focus:outline-none transition-colors"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-8 animate-fade-in-up">
              <p className="text-gray-600 text-lg mb-4">No quizzes are available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz, index) => (
                <div 
                  key={quiz.id} 
                  className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">{quiz.description || 'No description'}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => navigate(`/play/${quiz.id}`)}
                      className="w-full bg-gradient-to-r from-[#BFD732] to-[rgb(171,195,30)] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
                    >
                      Take Quiz
                    </button>
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