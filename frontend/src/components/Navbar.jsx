import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-black tracking-tight hover:text-gray-700 transition"
            >
              BlogApp
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs uppercase">
                    {(user.username || user.email || 'U').charAt(0)}
                  </div>
                  <span className="font-medium text-gray-800">{user.username || user.email}</span>
                </div>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-black hover:bg-gray-800 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  New Post
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-lg transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="text-gray-600 hover:text-black p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 px-4 pt-3 pb-4 space-y-3 bg-white shadow-lg">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs uppercase">
                  {(user.username || user.email || 'U').charAt(0)}
                </div>
                <span>Signed in as <strong className="text-black">{user.username || user.email}</strong></span>
              </div>
              <Link
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-black hover:bg-gray-800 transition"
              >
                New Post
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-lg transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
