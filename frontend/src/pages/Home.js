import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [category, setCategory] = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('all');
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  function startQuiz() {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    navigate(`/quiz?category=${category}&count=${questionCount}&difficulty=${difficulty}`);
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 flex flex-col items-center justify-center p-6 font-sans">

      {/* Navbar */}
      <div className="w-full max-w-xl flex justify-between items-center mb-6">
        <span className="text-white font-bold text-lg drop-shadow">
          👋 Hi, {username || 'Guest'}!
        </span>
        {token && (
          <button
            onClick={handleLogout}
            className="bg-white text-pink-500 font-bold px-4 py-1 rounded-full text-sm shadow hover:bg-pink-100 transition"
          >
            Logout
          </button>
        )}
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">📝</div>
          <h1 className="text-3xl font-extrabold text-purple-600 tracking-tight">CSE Reviewer</h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">by <span className="text-pink-400 font-bold">Zel</span> · Practice for your Civil Service Exam!</p>
        </div>

        {/* Options */}
        <div className="space-y-4">

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">📚 Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-purple-400 transition bg-purple-50"
            >
              <option value="all">All Categories</option>
              <option value="Verbal">Verbal</option>
              <option value="Numerical">Numerical</option>
              <option value="Analytical">Analytical</option>
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">🔢 Number of Questions</label>
            <select
              value={questionCount}
              onChange={e => setQuestionCount(e.target.value)}
              className="w-full border-2 border-pink-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-pink-400 transition bg-pink-50"
            >
              <option value={10}>10 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={50}>50 Questions</option>
              <option value={100}>100 Questions</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">⚡ Difficulty</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full border-2 border-yellow-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-yellow-400 transition bg-yellow-50"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Average">Average</option>
              <option value="Difficult">Difficult</option>
            </select>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startQuiz}
          className="mt-8 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg py-3 rounded-2xl shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all duration-150"
        >
          🚀 Start Quiz!
        </button>

        {!token && (
          <p className="text-center text-sm text-gray-400 mt-3">
            <a href="/login" className="text-purple-500 font-bold hover:underline">Login</a> or <a href="/register" className="text-pink-500 font-bold hover:underline">Register</a> to start!
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;