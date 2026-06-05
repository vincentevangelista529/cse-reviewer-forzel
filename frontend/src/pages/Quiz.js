import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category') || 'all';
    const count = params.get('count') || 10;
    const difficulty = params.get('difficulty') || 'all';

    fetch(`https://cse-reviewer-backend.onrender.com/quiz?category=${category}&count=${count}&difficulty=${difficulty}`)
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, []);

  function selectChoice(choice) {
    if (answered) return;
    setSelectedChoice(choice);
    setAnswered(true);
    if (choice.isCorrect) {
      setScore(score + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedChoice(null);
      setAnswered(false);
    } else {
      navigate(`/results?score=${score}&total=${questions.length}`);
    }
  }

  if (questions.length === 0) return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
        <div className="text-5xl mb-4 animate-bounce">⏳</div>
        <p className="text-purple-600 font-bold text-lg">Loading questions...</p>
      </div>
    </div>
  );

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  function getChoiceStyle(choice) {
    if (!answered) return 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50 cursor-pointer';
    if (choice.isCorrect) return 'bg-green-100 border-2 border-green-400 text-green-700 font-bold';
    if (selectedChoice === choice) return 'bg-red-100 border-2 border-red-400 text-red-700 font-bold';
    return 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-default';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8">

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>Score: {score} ⭐</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 mb-6 border-2 border-purple-100">
          <h2 className="text-gray-800 font-bold text-lg leading-relaxed">{current.question}</h2>
        </div>

        {/* Choices */}
        <div className="space-y-3">
          {current.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => selectChoice(choice)}
              className={`w-full text-left px-5 py-3 rounded-2xl transition-all duration-150 active:scale-95 ${getChoiceStyle(choice)}`}
            >
              <span className="font-bold mr-2 text-purple-400">{String.fromCharCode(65 + index)}.</span>
              {choice.text}
              {answered && choice.isCorrect && <span className="float-right">✅</span>}
              {answered && selectedChoice === choice && !choice.isCorrect && <span className="float-right">❌</span>}
            </button>
          ))}
        </div>

        {/* Next Button */}
        {answered && (
          <button
            onClick={nextQuestion}
            className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg py-3 rounded-2xl shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all duration-150"
          >
            {currentIndex + 1 < questions.length ? 'Next Question ➡️' : 'See Results 🏁'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;