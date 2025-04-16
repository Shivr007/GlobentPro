import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
}

const PlayQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const [playerName, setPlayerName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false);

  // In a real app, this would come from a server
  useEffect(() => {
    // For demo purposes, we're just getting from localStorage
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const foundQuiz = savedQuizzes.find((q: Quiz) => q.id === id);

    if (foundQuiz) {
      setQuiz(foundQuiz);
    }
  }, [id]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      setHasJoined(true);

      // In a real app, this would trigger a socket connection to join the game
      // For our demo, we'll start the game immediately
      startGame();
    }
  };

  const startGame = () => {
    // In a real app, the host would control when to start
    // For our demo, we'll go to the first question right away
    setCurrentQuestionIndex(0);

    if (quiz && quiz.questions.length > 0) {
      setTimeLeft(quiz.questions[0].timeLimit);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    // Only allow selecting if not already selected
    if (selectedAnswer === null) {
      setSelectedAnswer(answerId);
    }
  };

  const goToNextQuestion = () => {
    if (quiz) {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setTimeLeft(quiz.questions[nextIndex].timeLimit);
        setSelectedAnswer(null);
        setWaitingForNextQuestion(false);
      } else {
        // Game is over
        setGameOver(true);
      }
    }
  };

  // Timer countdown
  useEffect(() => {
    if (currentQuestionIndex >= 0 && !waitingForNextQuestion && !gameOver && timeLeft > 0 && selectedAnswer === null) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !waitingForNextQuestion && !gameOver) {
      // Time's up for this question
      setWaitingForNextQuestion(true);
    }
  }, [timeLeft, currentQuestionIndex, waitingForNextQuestion, gameOver, selectedAnswer]);

  // Auto-advance to next question after waiting period
  useEffect(() => {
    if (waitingForNextQuestion) {
      const timer = setTimeout(() => {
        goToNextQuestion();
      }, 3000); // Wait 3 seconds before next question

      return () => clearTimeout(timer);
    }
  }, [waitingForNextQuestion]);

  // Join screen
  if (!hasJoined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4">
        <div className="w-full max-w-md backdrop-blur-lg bg-white/90 rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Join Quiz</h1>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="playerName" className="block text-lg font-medium text-gray-700 mb-2">
                Your Nickname
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#BFD732] focus:border-transparent transition-all"
                placeholder="Enter your name"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#BFD732] hover:bg-[#a8bd2b] text-white py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Start Quiz
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">Quiz ID: <span className="font-mono font-bold">{id}</span></p>
          </div>
        </div>
      </div>
    );
  }

  // Waiting screen
  if (currentQuestionIndex === -1) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4">
        <div className="text-center bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome, {playerName}!</h1>
          <p className="text-xl mb-8 text-gray-600">Get ready to start...</p>
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-[#BFD732] rounded-full mx-auto flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameOver) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center max-w-md w-full">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Quiz Complete! 🎉</h1>
          <div className="bg-[#BFD732]/10 rounded-xl p-6 mb-8">
            <p className="text-xl text-gray-700 mb-2">Final Score</p>
            <p className="text-6xl font-bold text-[#BFD732]">{score}</p>
          </div>
          <p className="text-lg mb-8 text-gray-600">Well done, {playerName}!</p>
          <a
            href="/"
            className="inline-block bg-[#BFD732] hover:bg-[#a8bd2b] text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Result screen between questions
  if (waitingForNextQuestion) {
    const isCorrect = selectedAnswer !== null &&
      quiz?.questions[currentQuestionIndex].answers.find(a => a.id === selectedAnswer)?.isCorrect;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center">
          <h1 className="text-5xl mb-6">
            {isCorrect ? '🎯' : '😔'}
          </h1>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            {isCorrect ? 'Correct!' : 'Incorrect!'}
          </h2>
          {isCorrect && (
            <p className="text-xl mb-4 text-[#BFD732] font-bold">
              +{quiz?.questions[currentQuestionIndex].points} points
            </p>
          )}
          <p className="text-lg text-gray-600 mb-6">Next question in a moment...</p>
          <button
            onClick={goToNextQuestion}
            className="bg-white text-[#BFD732] px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform transition-all hover:scale-105"
          >
            Next Question
          </button>
        </div>
      </div>
    );
  }

  // Active question screen
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#BFD732] to-[#8fa41c]">
      <div className="bg-white/90 backdrop-blur-lg shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-gray-800">Question {currentQuestionIndex + 1}/{quiz?.questions.length}</span>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">Score: {score}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 max-w-6xl mx-auto w-full">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800">{quiz?.questions[currentQuestionIndex].text}</h2>
        </div>

        <div className="relative">
          {/* Timer positioned absolutely in the center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-[#BFD732] px-6 py-3 rounded-full">
              <p className="text-2xl font-bold text-white">{timeLeft}s</p>
            </div>
          </div>

          {/* Grid for answer options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {quiz?.questions[currentQuestionIndex].answers.map((answer, index) => {
              const colors = [
                'from-pink-500 to-red-500',
                'from-blue-500 to-indigo-500',
                'from-yellow-500 to-orange-500',
                'from-green-500 to-emerald-500'
              ];
              
              return (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  disabled={selectedAnswer !== null}
                  className={`p-8 rounded-2xl font-bold text-white transition-all transform hover:scale-105 hover:shadow-xl
                    ${selectedAnswer === answer.id ? 'ring-4 ring-white scale-105 shadow-xl' : ''}
                    bg-gradient-to-r ${colors[index]}`}
                >
                  {answer.text}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          {selectedAnswer !== null && !waitingForNextQuestion && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  // Update score before moving to next question
                  if (quiz && currentQuestionIndex >= 0) {
                    const currentQuestion = quiz.questions[currentQuestionIndex];
                    const selectedAnswerObj = currentQuestion.answers.find(a => a.id === selectedAnswer);

                    if (selectedAnswerObj && selectedAnswerObj.isCorrect) {
                      // Calculate score based on time left
                      const timeBonus = Math.floor((timeLeft / currentQuestion.timeLimit) * 500);
                      const pointsToAdd = currentQuestion.points + timeBonus;
                      setScore(prevScore => prevScore + pointsToAdd);
                    }
                  }
                  setWaitingForNextQuestion(true);
                }}
                className="bg-white text-[#BFD732] px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform transition-all hover:scale-105"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayQuiz;
