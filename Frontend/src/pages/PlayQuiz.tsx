// d:\Project\shivraj Comapny pr\GlobentPro\Frontend\src\pages\PlayQuiz.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

// Interfaces (keep as before)
interface Answer { id: string; _id?: string; text: string; isCorrect: boolean; }
interface Question { id: string; _id?: string; text: string; timeLimit: number; points: number; answers: Answer[]; }
interface Quiz { id: string; _id: string; title: string; description: string; questions: Question[]; }

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PlayQuiz = () => {
  const { idOrPin: idOrPinFromUrl } = useParams<{ idOrPin: string }>();
  const navigate = useNavigate();

  // State variables
  const [playerName, setPlayerName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  // --- REMOVED TIMER STATE ---
  // const [timeLeft, setTimeLeft] = useState(0);
  // const [initialTimeLimit, setInitialTimeLimit] = useState(0);
  // ---------------------------
  const [score, setScore] = useState(0);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for timers
  // --- REMOVED questionTimerRef ---
  // const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  // ------------------------------
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null); // Keep for results screen delay

  // --- Fetch Quiz Data (Keep as before, including validation) ---
  useEffect(() => {
    const fetchQuiz = async () => {
       // Clear previous advance timer on new fetch
       if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
       if (!idOrPinFromUrl) { setError("No Quiz ID or PIN provided in the URL."); setLoading(false); return; }
       setLoading(true); setError(null); setQuiz(null);
       let endpointUrl = '';
       const isPinFormat = /^[A-Z0-9]{6}$/i.test(idOrPinFromUrl);
       const isObjectIdFormat = /^[a-fA-F0-9]{24}$/.test(idOrPinFromUrl);
       if (isPinFormat) { endpointUrl = `${API_URL}/api/quiz/pin/${idOrPinFromUrl.toUpperCase()}`; }
       else if (isObjectIdFormat) { endpointUrl = `${API_URL}/api/quiz/${idOrPinFromUrl}`; }
       else { setError(`Invalid Quiz ID or PIN format: "${idOrPinFromUrl}".`); setLoading(false); return; }
       try {
         const response = await axios.get<any>(endpointUrl);
         const quizData = response.data;
         console.log('Raw quizData received from backend:', JSON.stringify(quizData, null, 2));
         if (!quizData || !quizData._id || !Array.isArray(quizData.questions)) { throw new Error("Invalid quiz data received from server (missing _id or questions array)."); }
         const mappedQuiz: Quiz = {
           ...quizData, id: quizData._id,
           questions: quizData.questions.map((q: any, qIndex: number) => {
             if (!q || typeof q.text !== 'string' || !Array.isArray(q.answers)) { console.warn(`Skipping invalid question structure at index ${qIndex} (missing text or answers array):`, q); return null; }
             const questionId = q._id || `temp-q-${qIndex}`; if (!q._id) console.warn(`Generated temporary ID for question: ${questionId}`);
             const mappedAnswers = q.answers.map((a: any, aIndex: number) => {
               if (!a || typeof a.text !== 'string' || typeof a.isCorrect !== 'boolean') { console.warn(`Skipping invalid answer structure at index ${aIndex} for question ${questionId}:`, a); return null; }
               const answerId = a._id || `temp-ans-${qIndex}-${aIndex}`; if (!a._id) console.warn(`Generated temporary ID for answer: ${answerId}`);
               return { ...a, id: answerId, _id: a._id };
             }).filter((a): a is Answer => a !== null);
             if (mappedAnswers.length < 2) { console.warn(`Skipping question ${questionId} due to insufficient valid answers (${mappedAnswers.length}) after filtering:`, q); return null; }
             // Keep timeLimit and points in data structure even if not used for timer display
             return { ...q, id: questionId, _id: q._id, answers: mappedAnswers, timeLimit: (typeof q.timeLimit === 'number' && q.timeLimit > 0) ? q.timeLimit : 30, points: (typeof q.points === 'number' && q.points >= 0) ? q.points : 100, };
           }).filter((q): q is Question => q !== null),
         };
         if (mappedQuiz.questions.length === 0 && quizData.questions.length > 0) { throw new Error("Quiz data loaded, but all questions have invalid structure."); }
         console.log(`Successfully processed and mapped quiz: ${mappedQuiz.title}`);
         setQuiz(mappedQuiz);
       } catch (err: any) {
         const axiosError = err as AxiosError<{ error?: string, message?: string }>; console.error(`Error processing quiz ${idOrPinFromUrl}:`, err);
         if (axiosError && axiosError.response) { const backendMsg = axiosError.response.data?.error || axiosError.response.data?.message || "An unknown server error occurred."; if (axiosError.response.status === 404) { setError(`Quiz not found for ${isPinFormat ? 'PIN' : 'ID'} "${idOrPinFromUrl}".`); } else { setError(`Failed to load quiz. Server Error (${axiosError.response.status}): ${backendMsg}`); } }
         else if (axiosError && axiosError.request) { setError("Failed to load quiz. No response from server."); }
         else { setError(`Failed to load quiz. Client Error: ${err.message}`); }
       } finally { setLoading(false); }
    };
    fetchQuiz();
    // Cleanup advance timer
    return () => { if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current); }
  }, [idOrPinFromUrl]);

  // --- Game Logic Effects ---

  // Initialize question state when index changes or game starts
  useEffect(() => {
    // No timer setup needed here anymore
    if (hasJoined && currentQuestionIndex >= 0 && !gameOver && quiz) {
      const currentQuestion = quiz.questions[currentQuestionIndex];
      if (currentQuestion) {
        // --- REMOVED TIMER STATE SETTERS ---
        // setTimeLeft(timeLimit);
        // setInitialTimeLimit(timeLimit);
        // ---------------------------------
        setSelectedAnswer(null);
        setWaitingForNextQuestion(false);
        console.log(`Starting question ${currentQuestionIndex + 1}`); // Removed time limit from log
      } else {
        console.error(`Invalid question index: ${currentQuestionIndex}. Ending game.`);
        setGameOver(true);
      }
    }
  }, [currentQuestionIndex, hasJoined, gameOver, quiz]); // Dependencies include quiz

  // --- REMOVED Question Timer Countdown Effect ---
  // useEffect(() => { ... timer logic ... }, [timeLeft, ...]);
  // ---------------------------------------------

  // Auto-advance from results screen (Keep as before)
  useEffect(() => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (waitingForNextQuestion && !gameOver) {
      console.log("Showing results, setting timer to advance...");
      advanceTimerRef.current = setTimeout(() => {
        console.log("Advancing to next question/game over...");
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
          setGameOver(true);
          setWaitingForNextQuestion(false);
        }
      }, 3000); // 3-second delay
    }
    return () => { if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current); };
  }, [waitingForNextQuestion, gameOver, currentQuestionIndex, quiz]);


  // --- Event Handlers ---
    // handleJoin (Keep as before)
    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (playerName.trim() && quiz) { setHasJoined(true); setCurrentQuestionIndex(0); }
        else if (!quiz) { setError("Cannot join yet, quiz data is still loading or failed to load."); }
        else if (!playerName.trim()) { alert("Please enter a nickname to join."); }
    };

    // handleAnswerSelect (Modified to remove timer logic)
    const handleAnswerSelect = (answerId: string) => {
        // Allow selection only if no answer selected yet and not waiting
        if (selectedAnswer === null && !waitingForNextQuestion && currentQuestionIndex >= 0 && quiz) {
        // --- REMOVED TIMER STOP LOGIC ---
        // if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
        // setTimeLeft(0);
        // ------------------------------

        setSelectedAnswer(answerId);
        const currentQuestion = quiz.questions[currentQuestionIndex];
        if (!currentQuestion) return;
        const selectedAnswerObj = currentQuestion.answers.find(a => a.id === answerId);
        if (selectedAnswerObj?.isCorrect) {
            const pointsToAdd = currentQuestion.points;
            setScore(prevScore => prevScore + pointsToAdd);
            console.log(`Correct answer selected! Added ${pointsToAdd} points.`);
        } else { console.log("Incorrect answer selected."); }
        setWaitingForNextQuestion(true); // Trigger results screen
        }
    };

  // --- Render Logic ---

  // 1. Loading State (Keep as before)
  if (loading) { return ( <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4"><div className="text-white text-2xl animate-pulse">Loading Quiz...</div></div> ); }
  // 2. Error State (Keep as before)
  if (error) { return ( <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4"><div className="w-full max-w-md backdrop-blur-lg bg-white/90 rounded-2xl shadow-2xl p-8 text-center"><h1 className="text-3xl font-bold mb-6 text-red-600">Error Loading Quiz</h1><p className="text-gray-700 mb-6">{error}</p><Link to="/join" className="inline-block bg-[#BFD732] hover:bg-[#a8bd2b] text-white py-3 px-6 rounded-lg font-bold transition-all">Try Another PIN</Link><Link to="/" className="mt-4 ml-4 inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-bold transition-all">Back to Home</Link></div></div> ); }
  // 3. Join Screen (Keep as before)
  if (!hasJoined && quiz) { return ( <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4"><div className="w-full max-w-md backdrop-blur-lg bg-white/90 rounded-2xl shadow-2xl p-8"><h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Join Quiz</h1><p className="text-center text-gray-600 mb-6 text-lg font-semibold">{quiz.title}</p><p className="text-center text-gray-500 mb-6 text-sm line-clamp-2">{quiz.description}</p><form onSubmit={handleJoin} className="space-y-6"><div><label htmlFor="playerName" className="block text-lg font-medium text-gray-700 mb-2">Your Nickname</label><input id="playerName" type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#BFD732] focus:border-transparent transition-all" placeholder="Enter your name" required autoFocus /></div><button type="submit" disabled={!playerName.trim()} className="w-full bg-[#BFD732] hover:bg-[#a8bd2b] text-white py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">Let's Go!</button></form><div className="mt-6 text-center"><p className="text-gray-600">Quiz ID/PIN: <span className="font-mono font-bold">{idOrPinFromUrl}</span></p></div></div></div> ); }
  // 4. Game Over Screen (Keep as before)
  if (gameOver) { return ( <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4"><div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center max-w-md w-full"><h1 className="text-4xl font-bold mb-6 text-gray-800">Quiz Complete! 🎉</h1><div className="bg-[#BFD732]/10 rounded-xl p-6 mb-8"><p className="text-xl text-gray-700 mb-2">Final Score for {playerName || 'Player'}</p><p className="text-6xl font-bold text-[#BFD732]">{score}</p></div><p className="text-lg mb-8 text-gray-600">Well done!</p><Link to="/" className="inline-block bg-[#BFD732] hover:bg-[#a8bd2b] text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105">Back to Home</Link><Link to="/join" className="mt-4 ml-4 inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-bold transition-all">Play Another Quiz</Link></div></div> ); }
  // 5. Result Screen (Modified to remove "Time's Up!" specific logic, though it won't be reached now)
  if (waitingForNextQuestion && currentQuestionIndex >= 0 && quiz) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) { return <div className="flex min-h-screen items-center justify-center bg-red-100 p-4 text-red-700">Error: Invalid question data during results.</div>; }
    const correctAnswer = currentQuestion.answers.find(a => a.isCorrect);
    const selectedAnswerObj = currentQuestion.answers.find(a => a.id === selectedAnswer);
    const isCorrect = selectedAnswerObj?.isCorrect ?? false;
    // const timeUp = selectedAnswer === "TIME_UP"; // This state is no longer possible

    return ( <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#BFD732] to-[#8fa41c] p-4"><div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center w-full max-w-lg">
        <h1 className="text-5xl mb-6"> {isCorrect ? '🎯' : '😔'} </h1> {/* Removed timeUp condition */}
        <h2 className="text-3xl font-bold mb-4 text-gray-800"> {isCorrect ? 'Correct!' : 'Incorrect!'} </h2> {/* Removed timeUp condition */}
        {!isCorrect && correctAnswer && ( <p className="text-lg text-gray-600 mb-4">The correct answer was: <span className="font-bold">{correctAnswer.text}</span></p> )} {/* Removed timeUp condition */}
        {isCorrect && ( <p className="text-lg text-green-600 font-bold mb-4">Good job!</p> )} {/* Removed timeUp condition */}
        <p className="text-xl mb-6 text-gray-700">Current Score: <span className="font-bold">{score}</span></p>
        <div className="animate-pulse text-gray-600">Next question coming up...</div>
    </div></div> );
  }


  // 6. Active Question Screen
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  if (!quiz || !currentQuestion) { return <div className="flex min-h-screen items-center justify-center bg-red-100 p-4 text-red-700">Error: Could not load current question state.</div>; }

  // --- REMOVED progressPercentage calculation ---

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#BFD732] to-[#8fa41c]">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-md p-4 sticky top-0 z-20">
        {/* *** MODIFIED HEADER LAYOUT - REMOVED TIMER/PROGRESS BAR *** */}
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <span className="text-sm md:text-lg font-bold text-gray-800 flex-shrink-0">
            Question {currentQuestionIndex + 1}/{quiz.questions.length}
          </span>
          {/* --- PROGRESS BAR REMOVED --- */}
          <p className="text-sm md:text-lg font-bold text-gray-800 flex-shrink-0">
            Score: {score}
          </p>
        </div>
        {/* ********************************************************* */}
      </div>

      {/* Question Area (Keep as before) */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl w-full text-center min-h-[100px] flex items-center justify-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">{currentQuestion.text}</h2>
        </div>

        {/* Answers Grid (Keep as before) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
          {currentQuestion.answers.map((answer, index) => {
            if (!answer || !answer.id) return null;
            const shapes = [ <svg key={`shape-${index}-triangle`} viewBox="0 0 100 100" className="w-5 h-5 mr-2 hidden md:inline-block"><polygon points="50,15 100,85 0,85" fill="currentColor"/></svg>, <svg key={`shape-${index}-diamond`} viewBox="0 0 100 100" className="w-5 h-5 mr-2 hidden md:inline-block"><polygon points="50,0 100,50 50,100 0,50" fill="currentColor"/></svg>, <svg key={`shape-${index}-circle`} viewBox="0 0 100 100" className="w-5 h-5 mr-2 hidden md:inline-block"><circle cx="50" cy="50" r="45" fill="currentColor"/></svg>, <svg key={`shape-${index}-square`} viewBox="0 0 100 100" className="w-5 h-5 mr-2 hidden md:inline-block"><rect width="90" height="90" x="5" y="5" fill="currentColor"/></svg> ];
            const bgColors = [ 'bg-red-500 hover:bg-red-600', 'bg-blue-500 hover:bg-blue-600', 'bg-yellow-500 hover:bg-yellow-600', 'bg-green-500 hover:bg-green-600' ];
            // Disable button only when waiting for next question (after an answer was selected)
            const isDisabled = selectedAnswer !== null || waitingForNextQuestion;
            return (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                disabled={isDisabled} // Use updated disabled logic
                className={` flex items-center justify-center p-4 md:p-6 min-h-[80px] rounded-lg font-bold text-lg md:text-xl text-white transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white ${bgColors[index % 4]} ${!isDisabled ? 'hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer' : 'opacity-75 cursor-not-allowed'} ${selectedAnswer === answer.id ? 'ring-4 ring-offset-2 ring-white scale-105 shadow-xl opacity-100' : ''} `}
              >
                {shapes[index % 4]}
                <span className="text-center flex-1">{answer.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlayQuiz;
