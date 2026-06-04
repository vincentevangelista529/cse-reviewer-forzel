import { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogin() {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      window.location.href = data.role === 'admin' ? '/admin' : '/';
    } else {
      setMessage(data.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🔐</div>
          <h2 className="text-2xl font-extrabold text-purple-600">Welcome Back!</h2>
          <p className="text-gray-400 text-sm mt-1">Login to continue your review</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">👤 Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-purple-400 transition bg-purple-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">🔑 Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border-2 border-pink-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-pink-400 transition bg-pink-50"
            />
          </div>
        </div>

        {/* Error message */}
        {message && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-xl px-4 py-2 text-center font-medium">
            ⚠️ {message}
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg py-3 rounded-2xl shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all duration-150"
        >
          Login 🚀
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          No account yet?{' '}
          <a href="/register" className="text-pink-500 font-bold hover:underline">Register here!</a>
        </p>
      </div>
    </div>
  );
}

export default Login;