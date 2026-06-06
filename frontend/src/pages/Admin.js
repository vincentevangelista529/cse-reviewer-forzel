import { useState, useEffect } from 'react';

const API = 'https://cse-reviewer-backend.onrender.com';

function parseQuestions(text) {
  const questions = [];
  // Split by question numbers like "1." "2." etc
  const blocks = text.split(/\n(?=\d+[.)]\s)/);

  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    // First line is the question (remove leading number)
    const questionLine = lines[0].replace(/^\d+[.)]\s*/, '').trim();
    if (!questionLine) continue;

    const choices = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Match lines starting with A. B. C. D. or A) B) C) D)
      const match = line.match(/^([A-Da-d][.)]\s*)(.+)/);
      if (match) {
        choices.push({ text: match[2].trim(), isCorrect: false });
      }
    }

    if (choices.length >= 2) {
      questions.push({ question: questionLine, choices, selected: true });
    }
  }
  return questions;
}

function Admin() {
  const [activeTab, setActiveTab] = useState('import');

  // Manual add state
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('Numerical');
  const [difficulty, setDifficulty] = useState('Easy');
  const [choices, setChoices] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  // Import state
  const [importText, setImportText] = useState('');
  const [importCategory, setImportCategory] = useState('Numerical');
  const [importDifficulty, setImportDifficulty] = useState('Easy');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [isSavingAll, setIsSavingAll] = useState(false);

  // Database state
  const [allQuestions, setAllQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem('token');

  async function fetchQuestions() {
    setIsLoadingQuestions(true);
    try {
      const res = await fetch(`${API}/questions`);
      const data = await res.json();
      setAllQuestions(data);
    } catch (e) {
      alert('Failed to load questions');
    }
    setIsLoadingQuestions(false);
  }

  useEffect(() => {
    if (activeTab === 'database') fetchQuestions();
  }, [activeTab]);

  // ── Manual add ──
  async function addQuestion() {
    if (!question.trim()) return alert('Please enter a question!');
    if (!choices.some(c => c.isCorrect)) return alert('Please select a correct answer!');
    const res = await fetch(`${API}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ question, category, difficulty, choices })
    });
    const data = await res.json();
    if (data.success) {
      alert('Question Added! 🎉');
      setQuestion('');
      setChoices([
        { text: '', isCorrect: false }, { text: '', isCorrect: false },
        { text: '', isCorrect: false }, { text: '', isCorrect: false }
      ]);
    } else alert(data.message);
  }

  function updateChoice(index, text) {
    const c = [...choices]; c[index].text = text; setChoices(c);
  }
  function markCorrect(index) {
    setChoices(choices.map((c, i) => ({ ...c, isCorrect: i === index })));
  }

  // ── Smart Paste Parser ──
  function handleParse() {
    if (!importText.trim()) return alert('Please paste some questions first!');
    const parsed = parseQuestions(importText);
    if (parsed.length === 0) return alert('No questions found! Make sure format is:\n1. Question\nA. Choice\nB. Choice\nC. Choice\nD. Choice');
    setParsedQuestions(parsed.map(q => ({ ...q, category: importCategory, difficulty: importDifficulty })));
  }

  function toggleSelect(qIndex) {
    const updated = [...parsedQuestions];
    updated[qIndex].selected = !updated[qIndex].selected;
    setParsedQuestions(updated);
  }

  function markCorrectParsed(qIndex, cIndex) {
    const updated = [...parsedQuestions];
    updated[qIndex].choices = updated[qIndex].choices.map((c, i) => ({
      ...c, isCorrect: i === cIndex
    }));
    setParsedQuestions(updated);
  }

  async function saveAllParsed() {
    const toSave = parsedQuestions.filter(q => q.selected);
    if (toSave.length === 0) return alert('No questions selected!');

    const noAnswer = toSave.filter(q => !q.choices.some(c => c.isCorrect));
    if (noAnswer.length > 0) return alert(`Please mark the correct answer for all questions! ${noAnswer.length} question(s) still missing a correct answer.`);

    setIsSavingAll(true);
    let saved = 0;
    for (const q of toSave) {
      const res = await fetch(`${API}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question: q.question, category: q.category, difficulty: q.difficulty, choices: q.choices })
      });
      const data = await res.json();
      if (data.success) saved++;
    }
    setIsSavingAll(false);
    alert(`🎉 ${saved} questions saved!`);
    setParsedQuestions([]);
    setImportText('');
  }

  // ── Delete ──
  async function deleteQuestion(id) {
    if (!window.confirm('Delete this question?')) return;
    setDeletingId(id);
    const res = await fetch(`${API}/questions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setAllQuestions(allQuestions.filter(q => q.id !== id));
    else alert(data.message);
    setDeletingId(null);
  }

  const filteredQuestions = allQuestions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const choiceLabels = ['A', 'B', 'C', 'D'];
  const colorMap = {
    0: 'border-purple-200 bg-purple-50',
    1: 'border-pink-200 bg-pink-50',
    2: 'border-yellow-200 bg-yellow-50',
    3: 'border-blue-200 bg-blue-50',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🛠️</div>
          <h2 className="text-2xl font-extrabold text-white drop-shadow">Admin Panel</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/30 p-1 rounded-2xl">
          {[
            { id: 'import', label: '📋 Paste Import' },
            { id: 'manual', label: '✏️ Manual Add' },
            { id: 'database', label: '🗄️ Database' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-white text-purple-600 shadow' : 'text-white hover:bg-white/20'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PASTE IMPORT TAB ── */}
        {activeTab === 'import' && (
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="font-extrabold text-purple-600 text-lg mb-1">📋 Smart Paste Importer</h3>
            <p className="text-gray-400 text-sm mb-1">Paste questions from Claude or any reviewer. Format:</p>
            <div className="bg-gray-50 rounded-xl px-4 py-2 mb-4 text-xs text-gray-500 font-mono">
              1. Question here?<br/>
              A. Choice one<br/>
              B. Choice two<br/>
              C. Choice three<br/>
              D. Choice four
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">📚 Category</label>
                <select value={importCategory} onChange={e => setImportCategory(e.target.value)}
                  className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none bg-purple-50">
                  <option>Verbal</option><option>Numerical</option><option>Analytical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">⚡ Difficulty</label>
                <select value={importDifficulty} onChange={e => setImportDifficulty(e.target.value)}
                  className="w-full border-2 border-pink-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none bg-pink-50">
                  <option>Easy</option><option>Average</option><option>Difficult</option>
                </select>
              </div>
            </div>

            <textarea rows={8}
              placeholder={"Paste your questions here...\n\n1. What is 18% of 650?\nA. 107\nB. 137\nC. 117\nD. 127\n\n2. If 4x - 7 = 29, what is x?\nA. 10\nB. 9\nC. 7\nD. 8"}
              value={importText} onChange={e => setImportText(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-purple-400 transition bg-gray-50 resize-none text-sm mb-4" />

            <button onClick={handleParse}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold py-3 rounded-2xl shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all">
              🔍 Parse Questions
            </button>

            {/* Parsed preview — mark correct answers */}
            {parsedQuestions.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-extrabold text-purple-600">Found {parsedQuestions.length} Questions!</h4>
                  <span className="text-xs text-gray-400 bg-yellow-50 border border-yellow-200 text-yellow-600 px-2 py-1 rounded-full font-bold">👆 Tap correct answer</span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {parsedQuestions.map((q, qi) => (
                    <div key={qi} className={`rounded-2xl border-2 overflow-hidden transition ${q.selected ? 'border-purple-200' : 'border-gray-200 opacity-50'}`}>

                      {/* Question header */}
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer"
                        onClick={() => toggleSelect(qi)}>
                        <span className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold ${q.selected ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300'}`}>
                          {q.selected ? '✓' : ''}
                        </span>
                        <p className="font-bold text-gray-800 text-sm flex-1">{qi + 1}. {q.question}</p>
                      </div>

                      {/* Choices — click to mark correct */}
                      <div className="p-3 space-y-2">
                        {q.choices.map((c, ci) => (
                          <button key={ci} onClick={() => markCorrectParsed(qi, ci)}
                            className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 border-2 ${
                              c.isCorrect
                                ? 'bg-green-100 border-green-400 text-green-700 font-bold'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                            }`}>
                            <span className="font-bold mr-2">{choiceLabels[ci]}.</span>
                            {c.text}
                            {c.isCorrect && <span className="float-right">✅</span>}
                          </button>
                        ))}
                        {!q.choices.some(c => c.isCorrect) && (
                          <p className="text-xs text-red-400 font-bold text-center pt-1">⚠️ Tap the correct answer above!</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={saveAllParsed} disabled={isSavingAll}
                  className="mt-4 w-full bg-gradient-to-r from-green-400 to-teal-400 text-white font-extrabold py-3 rounded-2xl shadow-lg hover:from-green-500 hover:to-teal-500 active:scale-95 transition-all disabled:opacity-60">
                  {isSavingAll ? 'Saving...' : `💾 Save ${parsedQuestions.filter(q => q.selected).length} Questions`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MANUAL TAB ── */}
        {activeTab === 'manual' && (
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="font-extrabold text-purple-600 text-lg mb-4">✏️ Add Question Manually</h3>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-600 mb-1">❓ Question</label>
              <textarea placeholder="Type your question here..." value={question}
                onChange={e => setQuestion(e.target.value)} rows={3}
                className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-purple-400 transition bg-purple-50 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">📚 Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full border-2 border-pink-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none bg-pink-50">
                  <option>Verbal</option><option>Numerical</option><option>Analytical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">⚡ Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className="w-full border-2 border-yellow-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none bg-yellow-50">
                  <option>Easy</option><option>Average</option><option>Difficult</option>
                </select>
              </div>
            </div>
            <label className="block text-sm font-bold text-gray-600 mb-3">🔤 Choices</label>
            <div className="space-y-3 mb-6">
              {choices.map((choice, index) => (
                <div key={index} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition ${choice.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                  <span className={`font-extrabold text-sm w-6 text-center ${choice.isCorrect ? 'text-green-500' : 'text-gray-400'}`}>{choiceLabels[index]}</span>
                  <input type="text" placeholder={`Choice ${choiceLabels[index]}`} value={choice.text}
                    onChange={e => updateChoice(index, e.target.value)}
                    className={`flex-1 border-2 rounded-xl px-3 py-1.5 text-gray-700 focus:outline-none transition text-sm ${colorMap[index]}`} />
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="correct" checked={choice.isCorrect} onChange={() => markCorrect(index)} className="accent-green-500 w-4 h-4" />
                    <span className="text-sm">✅</span>
                  </label>
                </div>
              ))}
            </div>
            <button onClick={addQuestion}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg py-3 rounded-2xl shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all">
              ➕ Add Question
            </button>
          </div>
        )}

        {/* ── DATABASE TAB ── */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-purple-600 text-lg">🗄️ Question Database</h3>
              <button onClick={fetchQuestions} className="text-xs bg-purple-100 text-purple-500 font-bold px-3 py-1 rounded-full hover:bg-purple-200 transition">
                🔄 Refresh
              </button>
            </div>
            <input type="text" placeholder="🔍 Search questions..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-purple-400 transition bg-purple-50 mb-3" />
            <p className="text-sm text-gray-400 mb-3 font-medium">{filteredQuestions.length} of {allQuestions.length} questions</p>

            {isLoadingQuestions ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-2 animate-bounce">⏳</div>
                <p className="text-purple-500 font-bold">Loading questions...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-400 font-medium">No questions found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredQuestions.map((q, i) => (
                  <div key={q.id} className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-purple-200 transition">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-1">
                          <span className="text-xs bg-purple-100 text-purple-600 font-bold px-2 py-0.5 rounded-full">{q.category}</span>
                          <span className="text-xs bg-pink-100 text-pink-600 font-bold px-2 py-0.5 rounded-full">{q.difficulty}</span>
                        </div>
                        <p className="text-gray-800 font-bold text-sm">{i + 1}. {q.question}</p>
                      </div>
                      <button onClick={() => deleteQuestion(q.id)} disabled={deletingId === q.id}
                        className="flex-shrink-0 bg-red-100 hover:bg-red-200 text-red-500 font-bold px-3 py-1.5 rounded-xl text-xs transition active:scale-95 disabled:opacity-50">
                        {deletingId === q.id ? '...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;