function Results() {
  const params = new URLSearchParams(window.location.search);
  const score = parseInt(params.get('score'));
  const total = parseInt(params.get('total'));
  const percentage = Math.round((score / total) * 100);

  function getResultEmoji() {
    if (percentage >= 80) return '🏆';
    if (percentage >= 60) return '💪';
    return '📖';
  }

  function getResultMessage() {
    if (percentage >= 80) return { title: "Excellent!", sub: "You're ready for the CSE!", color: "text-green-500" };
    if (percentage >= 60) return { title: "Good Job!", sub: "Keep practicing, you're getting there!", color: "text-yellow-500" };
    return { title: "Keep Studying!", sub: "You got this! Review and try again.", color: "text-pink-500" };
  }

  function getBarColor() {
    if (percentage >= 80) return 'from-green-400 to-teal-400';
    if (percentage >= 60) return 'from-yellow-400 to-orange-400';
    return 'from-pink-400 to-red-400';
  }

  const result = getResultMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div className="text-7xl mb-4">{getResultEmoji()}</div>
        <h1 className="text-2xl font-extrabold text-purple-600 mb-1">Quiz Complete!</h1>
        <h2 className={`text-xl font-extrabold mb-1 ${result.color}`}>{result.title}</h2>
        <p className="text-gray-400 text-sm mb-6">{result.sub}</p>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 p-6 mb-6">
          <p className="text-5xl font-extrabold text-purple-600">{score}<span className="text-2xl text-gray-300">/{total}</span></p>
          <p className="text-gray-400 text-sm mt-1 font-medium">correct answers</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
            <span>Score</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4">
            <div
              className={`bg-gradient-to-r ${getBarColor()} h-4 rounded-full transition-all duration-700`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg py-3 rounded-2xl shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all duration-150 mb-3"
        >
          🔄 Try Again
        </button>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-white border-2 border-purple-200 text-purple-500 font-bold py-3 rounded-2xl hover:bg-purple-50 active:scale-95 transition-all duration-150"
        >
          🏠 Go Home
        </button>
      </div>
    </div>
  );
}

export default Results;