import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  timeLimit: number;
  points: number;
  answers: Answer[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

const HostQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/quiz/${id}`);
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        console.error('Error fetching quiz:', err);
      }
    };
  
    fetchQuiz();
  }, [id]);
  
  

  const startGame = () => {
    setGameActive(true);
    setCurrentQuestionIndex(0);

    if (quiz && quiz.questions.length > 0) {
      setTimeLeft(quiz.questions[0].timeLimit);
    }
  };

  const nextQuestion = () => {
    if (quiz) {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setTimeLeft(quiz.questions[nextIndex].timeLimit);
      } else {
        // Game is over
        setShowResults(true);
      }
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameActive && currentQuestionIndex >= 0 && !showResults && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeLeft, currentQuestionIndex, gameActive, showResults]);

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading quiz...</h1>
          <p>If the quiz doesn't load, it may not exist.</p>
          <Link to="/" className="text-[#46178f] font-bold hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Lobby screen before starting
  if (!gameActive) {
    return (
      <div className="flex min-h-screen flex-col bg-[#46178f] text-white">
        <header className="p-4 bg-[#3b1378] shadow-md">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-2xl">
            <h2 className="text-4xl font-bold mb-8">Game PIN: {id}</h2>
            <p className="text-xl mb-4">Share this PIN with your players.</p>
            <p className="text-xl mb-8">Tell them to go to <span className="font-bold">kahoot.it</span> and enter this PIN.</p>

            <div className="mb-8 p-6 bg-white text-[#46178f] rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Game Info</h3>
              <p className="mb-2"><span className="font-bold">Questions:</span> {quiz.questions.length}</p>
              <p><span className="font-bold">Created:</span> {new Date(quiz.createdAt).toLocaleDateString()}</p>
            </div>

            <button
              onClick={startGame}
              className="bg-white text-[#46178f] px-8 py-4 rounded-md text-xl font-bold hover:bg-opacity-90 transition-all"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    return (
      <div className="flex min-h-screen flex-col bg-[#46178f] text-white">
        <header className="p-4 bg-[#3b1378] shadow-md">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-2xl">
            <h2 className="text-4xl font-bold mb-6">Game Completed!</h2>
            <p className="text-xl mb-8">The game has ended. Players can see their final scores.</p>

            <div className="flex space-x-4">
              <Link
                to="/"
                className="bg-white text-[#46178f] px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition-all"
              >
                Back to Home
              </Link>
              <button
                onClick={() => {
                  setGameActive(false);
                  setCurrentQuestionIndex(-1);
                  setShowResults(false);
                }}
                className="border-2 border-white text-white px-6 py-3 rounded-md font-bold hover:bg-white hover:bg-opacity-10 transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question display for host
  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="flex min-h-screen flex-col bg-[#46178f] text-white">
      <header className="p-4 bg-[#3b1378] shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">{quiz.title}</h1>
        <div className="text-2xl font-bold">{timeLeft}s</div>
      </header>

      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6">
          <p className="text-sm mb-1">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
          <h2 className="text-3xl font-bold">{currentQuestion.text}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {currentQuestion.answers.map((answer, index) => (
            <div
              key={answer.id}
              className={`p-6 rounded-lg ${
                index === 0 ? 'bg-red-500' :
                index === 1 ? 'bg-blue-500' :
                index === 2 ? 'bg-yellow-500' :
                'bg-green-500'
              } flex justify-between items-center`}
            >
              <span className="text-xl font-bold">{answer.text}</span>
              {answer.isCorrect && (
                <span className="text-2xl">✓</span>
              )}
            </div>
          ))}
        </div>

        {timeLeft === 0 && (
          <div className="flex justify-center">
            <button
              onClick={nextQuestion}
              className="bg-white text-[#46178f] px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition-all"
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Show Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostQuiz;
