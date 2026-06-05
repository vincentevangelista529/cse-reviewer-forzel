import { useState } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleRegister() {
    const response = await fetch('https://cse-reviewer-backend.onrender.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    setMessage(data.message);

    if (data.success) {
      window.location.href = '/login';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">✨</div>
          <h2 className="text-2xl font-extrabold text-purple-600">Create Account</h2>
          <p className="text-gray-400 text-sm mt-1">Join and start your CSE review!</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">👤 Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-purple-400 transition bg-purple-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">🔑 Password</label>
            <input
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border-2 border-pink-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-pink-400 transition bg-pink-50"
            />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-600 text-sm rounded-xl px-4 py-2 text-center font-medium">
            {message}
          </div>
        )}

        {/* Register Button */}
        <button
          onClick={handleRegister}
          className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-extrabold text-lg py-3 rounded-2xl shadow-lg hover:from-yellow-500 hover:to-pink-500 active:scale-95 transition-all duration-150"
        >
          Register 🎉
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-purple-500 font-bold hover:underline">Login here!</a>
        </p>
      </div>
    </div>
  );
}

export default Register;