import { Link, useNavigate } from 'react-router-dom';
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

const Home = () => {
  const navigate = useNavigate();
  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    setSavedQuizzes(quizzes);
  }, []);

  const deleteQuiz = (quizId: string) => {
    const updatedQuizzes = savedQuizzes.filter(quiz => quiz.id !== quizId);
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    setSavedQuizzes(updatedQuizzes);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[rgb(191,215,50)] py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Make learning awesome!</h1>
          <p className="text-xl md:text-2xl mb-8">
            GlobQuiz! is a game-based learning platform that brings engagement and fun
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/create"
              className="border-2 border-white text-black px-6 py-3 rounded-md font-bold text-lg hover:bg-white hover:bg-opacity-20 transition-all"
            >
              Create a GlobQuiz!
            </Link>
            <Link
              to="/join"
              className="border-2 border-white text-black py-3 px-6 rounded-md font-bold text-lg hover:bg-white hover:bg-opacity-10 transition-all"
            >
              Join game
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Learning Quiz",
              description: "Engaging group and distance learning for teachers and students.",
            },
            {
              title: "GlobQuiz",
              description: "Deliver training, presentations, meetings and events in-person or online.",
            },
            {
              title: "For Fun",
              description: "Fun quizzes for parties and gatherings.",
            },
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-[#BFD732] mb-4">{feature.title}</h2>
              <p className="text-gray-700 mb-6">{feature.description}</p>
              <Link to="/create" className="text-[#BFD732] font-bold hover:underline">
                Learn more &gt;
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-[#f2f2f2] py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#BFD732] mb-10">How GlobQuiz! works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Create", "Host", "Play"].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#BFD732] text-white flex items-center justify-center text-2xl font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-2">{step}</h3>
                <p className="text-gray-700">
                  {step === "Create" && "Create engaging quizzes in minutes"}
                  {step === "Host" && "Host a live game or assign as homework"}
                  {step === "Play" && "Join with a PIN and play from any device"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Quizzes Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#BFD732] mb-8">My Quizzes</h2>
          {savedQuizzes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg mb-4">You haven't created any quizzes yet.</p>
              <Link
                to="/create"
                className="inline-block bg-[#BFD732] text-white px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition-all"
              >
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-gray-50 rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {quiz.description || 'No description'}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Created: {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/play/${quiz.id}`)}
                      className="flex-1 bg-[#BFD732] text-white px-4 py-2 rounded-md font-bold hover:bg-opacity-90 transition-all"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz.id)}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-all"
                    >
                      Delete
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

export default Home;
