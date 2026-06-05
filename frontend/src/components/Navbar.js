import { Link } from 'react-router-dom';

function Navbar() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '/';
  }

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex items-center justify-between">
      
      {/* Logo */}
      <Link
        to="/"
        className="text-purple-600 font-extrabold text-lg hover:text-pink-500 transition"
      >
        📝 CSE Reviewer BY ZEL!
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {token ? (
          <>
            {role === 'admin' && (
              <Link
                to="/admin"
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-1.5 rounded-full text-sm transition"
              >
                🛠️ Admin Panel
              </Link>
            )}
            <span className="text-gray-500 font-medium text-sm hidden sm:block">
              👋 Hi, <span className="text-purple-500 font-bold">{username}</span>!
            </span>
            <button
              onClick={handleLogout}
              className="bg-pink-100 hover:bg-pink-200 text-pink-500 font-bold px-4 py-1.5 rounded-full text-sm transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-purple-500 font-bold hover:underline text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-1.5 rounded-full text-sm hover:from-purple-600 hover:to-pink-600 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;