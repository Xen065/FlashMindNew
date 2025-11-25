import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NestedDropdown from './NestedDropdown';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  // Fetch course categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/public/course-categories/tree');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError(true);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h1>FlashMind</h1>
        </Link>

        {user && (
          <div className="nav-search">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                🔍
              </button>
            </form>
          </div>
        )}

        <ul className="nav-menu">
          {user ? (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li>
                <NestedDropdown
                  categories={categories}
                  loading={categoriesLoading}
                  error={categoriesError}
                />
              </li>
              <li>
                <Link to="/study" className="nav-primary-action">
                  Start Studying
                </Link>
              </li>
              {(user.role === 'admin' || user.role === 'super_admin') && (
                <li><Link to="/admin">Admin</Link></li>
              )}
              <li>
                <button onClick={toggleTheme} className="theme-toggle-button" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </li>
              <li className="profile-dropdown">
                <button
                  className="profile-button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  onBlur={() => setTimeout(() => setShowProfileMenu(false), 300)}
                >
                  <div className="profile-avatar">
                    {getInitials(user.username)}
                  </div>
                  <span className="profile-name">{user.username}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {showProfileMenu && (
                  <div className="profile-menu">
                    <Link to="/dashboard" className="profile-menu-item">
                      <span className="menu-icon">📊</span>
                      Stats & Progress
                    </Link>
                    <Link to="/dashboard" className="profile-menu-item">
                      <span className="menu-icon">⚙️</span>
                      Settings
                    </Link>
                    <button onMouseDown={handleLogout} className="profile-menu-item logout-item">
                      <span className="menu-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <NestedDropdown
                  categories={categories}
                  loading={categoriesLoading}
                  error={categoriesError}
                />
              </li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register" className="nav-cta">Get Started Free</Link></li>
              <li>
                <button onClick={toggleTheme} className="theme-toggle-button" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
