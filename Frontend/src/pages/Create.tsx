import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import Navbar from '../components/Navbar';

interface Question {
  id: string;
  text: string;
  timeLimit: number;
  points: number;
  answers: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

const Create = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: nanoid(),
      text: '',
      timeLimit: 20,
      points: 100,
      answers: [
        { id: nanoid(), text: '', isCorrect: false },
        { id: nanoid(), text: '', isCorrect: false },
        { id: nanoid(), text: '', isCorrect: false },
        { id: nanoid(), text: '', isCorrect: false }
      ]
    }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: nanoid(),
        text: '',
        timeLimit: 20,
        points: 100,
        answers: [
          { id: nanoid(), text: '', isCorrect: false },
          { id: nanoid(), text: '', isCorrect: false },
          { id: nanoid(), text: '', isCorrect: false },
          { id: nanoid(), text: '', isCorrect: false }
        ]
      }
    ]);
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions(
      questions.map(q => (q.id === id ? { ...q, text } : q))
    );
  };

  const updateAnswerText = (questionId: string, answerId: string, text: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map(a =>
                a.id === answerId ? { ...a, text } : a
              )
            }
          : q
      )
    );
  };

  const toggleCorrectAnswer = (questionId: string, answerId: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map(a =>
                a.id === answerId ? { ...a, isCorrect: !a.isCorrect } : a
              )
            }
          : q
      )
    );
  };

  const updateTimeLimit = (id: string, timeLimit: number) => {
    setQuestions(
      questions.map(q => (q.id === id ? { ...q, timeLimit } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Very basic validation
    if (!title) {
      alert('Please enter a title for your quiz');
      return;
    }

    const hasEmptyQuestions = questions.some(q => !q.text);
    if (hasEmptyQuestions) {
      alert('Please fill out all question texts');
      return;
    }

    const hasNoCorrectAnswers = questions.some(q => !q.answers.some(a => a.isCorrect));
    if (hasNoCorrectAnswers) {
      alert('Each question must have at least one correct answer');
      return;
    }

    // In a real app, you would save to a database
    // For now, we'll just generate a random ID and route to the host page
    const quizId = nanoid(6);

    // Save quiz to localStorage for demo purposes
    const quiz = {
      id: quizId,
      title,
      description,
      questions,
      createdAt: new Date().toISOString()
    };

    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    localStorage.setItem('quizzes', JSON.stringify([...savedQuizzes, quiz]));

    navigate(`/host/${quizId}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8f8]">
      <Navbar />

      <div className="py-6 px-4 flex-1">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-[rgb(0,0,0)] mb-6">Create a new GlobQuiz!</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(191,215,50)]"
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(191,215,50)]"
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[rgb(0,0,0)] mb-4">Questions</h2>

              {questions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className="border border-gray-300 rounded-lg p-4 mb-6 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Question {qIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={questions.length === 1}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mb-4">
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestionText(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(191,215,50)]"
                      placeholder="Enter question text"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Time limit: {question.timeLimit} seconds
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={question.timeLimit}
                      onChange={(e) => updateTimeLimit(question.id, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-2">
                    <h4 className="text-lg font-bold mb-2">Answers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.answers.map((answer, aIndex) => (
                        <div
                          key={answer.id}
                          className={`p-3 rounded-md flex items-center ${
                            aIndex === 0 ? 'bg-red-100' :
                            aIndex === 1 ? 'bg-blue-100' :
                            aIndex === 2 ? 'bg-yellow-100' :
                            'bg-green-100'
                          }`}
                        >
                          <input
                            type="text"
                            value={answer.text}
                            onChange={(e) => updateAnswerText(question.id, answer.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md mr-2"
                            placeholder={`Answer ${aIndex + 1}`}
                            required
                          />
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={answer.isCorrect}
                              onChange={() => toggleCorrectAnswer(question.id, answer.id)}
                              className="mr-2 h-5 w-5"
                            />
                            Correct
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addQuestion}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-all mb-6"
              >
                + Add Question
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[rgb(191,215,50)] text-white px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition-all"
              >
                Create Quiz
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Create;
