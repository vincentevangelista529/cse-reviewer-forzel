import { useState } from 'react';

function Admin() {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('Verbal');
  const [difficulty, setDifficulty] = useState('Easy');
  const [choices, setChoices] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  async function addQuestion() {
    const token = localStorage.getItem('token');

    const response = await fetch('https://cse-reviewer-backend.onrender.com/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question, category, difficulty, choices })
    });

    const data = await response.json();

    if (data.success) {
      alert('Question Added Successfully! 🎉');
      setQuestion('');
      setChoices([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]);
    } else {
      alert(data.message);
    }
  }

  function updateChoice(index, text) {
    const newChoices = [...choices];
    newChoices[index].text = text;
    setChoices(newChoices);
  }

  function markCorrect(index) {
    const newChoices = choices.map((choice, i) => ({
      ...choice,
      isCorrect: i === index
    }));
    setChoices(newChoices);
  }

  const choiceLabels = ['A', 'B', 'C', 'D'];
  const choiceColors = ['purple', 'pink', 'yellow', 'blue'];
  const colorMap = {
    purple: 'border-purple-200 bg-purple-50 focus:border-purple-400',
    pink: 'border-pink-200 bg-pink-50 focus:border-pink-400',
    yellow: 'border-yellow-200 bg-yellow-50 focus:border-yellow-400',
    blue: 'border-blue-200 bg-blue-50 focus:border-blue-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🛠️</div>
          <h2 className="text-2xl font-extrabold text-purple-600">Admin Panel</h2>
          <p className="text-gray-400 text-sm mt-1">Add new questions to the reviewer</p>
        </div>

        {/* Question */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-600 mb-1">❓ Question</label>
          <textarea
            placeholder="Type your question here..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={3}
            className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-purple-400 transition bg-purple-50 resize-none"
          />
        </div>

        {/* Category & Difficulty */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">📚 Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border-2 border-pink-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-pink-400 transition bg-pink-50"
            >
              <option value="Verbal">Verbal</option>
              <option value="Numerical">Numerical</option>
              <option value="Analytical">Analytical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">⚡ Difficulty</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full border-2 border-yellow-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-yellow-400 transition bg-yellow-50"
            >
              <option value="Easy">Easy</option>
              <option value="Average">Average</option>
              <option value="Difficult">Difficult</option>
            </select>
          </div>
        </div>

        {/* Choices */}
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-3">🔤 Choices <span className="text-gray-400 font-normal">(select the correct answer)</span></label>
          <div className="space-y-3">
            {choices.map((choice, index) => (
              <div key={index} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition ${choice.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                <span className={`font-extrabold text-sm w-6 text-center ${choice.isCorrect ? 'text-green-500' : 'text-gray-400'}`}>
                  {choiceLabels[index]}
                </span>
                <input
                  type="text"
                  placeholder={`Choice ${choiceLabels[index]}`}
                  value={choice.text}
                  onChange={e => updateChoice(index, e.target.value)}
                  className={`flex-1 border-2 rounded-xl px-3 py-1.5 text-gray-700 focus:outline-none transition text-sm ${colorMap[choiceColors[index]]}`}
                />
                <label className="flex items-center gap-1 cursor-pointer text-sm font-bold text-gray-500">
                  <input
                    type="radio"
                    name="correct"
                    checked={choice.isCorrect}
                    onChange={() => markCorrect(index)}
                    className="accent-green-500 w-4 h-4"
                  />
                  ✅
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={addQuestion}
          className="mt-8 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg py-3 rounded-2xl shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all duration-150"
        >
          ➕ Add Question
        </button>
      </div>
    </div>
  );
}

export default Admin;