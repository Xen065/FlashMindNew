import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NestedDropdown from './NestedDropdown';
import './Navigation.css';
import axios from 'axios';
import config from '../config';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch course categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/public/course-categories/tree`);
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If user is logged in, navigate to courses page
      if (user) {
        navigate(`/courses?search=${searchQuery}`);
        setSearchQuery('');
        setShowSearchResults(false);
      } else {
        // For guest users, show inline results
        try {
          setSearchLoading(true);
          setShowSearchResults(true);
          const response = await axios.get(`${config.apiUrl}/api/courses?search=${encodeURIComponent(searchQuery)}`);
          setSearchResults(response.data.data?.courses || []);
        } catch (error) {
          console.error('Error searching courses:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }
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

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-search')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSearchResults]);

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h1>FlashMind</h1>
        </Link>

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

          {/* Search results dropdown for guest users */}
          {!user && showSearchResults && (
            <div className="nav-search-results">
              {searchLoading ? (
                <div className="nav-search-loading">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="nav-search-results-header">
                    Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  <div className="nav-search-results-list">
                    {searchResults.slice(0, 5).map(course => (
                      <Link
                        key={course.id}
                        to={`/courses/${course.id}`}
                        className="nav-search-result-item"
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                      >
                        <span className="result-icon">{course.icon || '📚'}</span>
                        <div className="result-info">
                          <div className="result-title">{course.title}</div>
                          <div className="result-meta">
                            {course.cardCount} cards • {course.difficulty}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {searchResults.length > 5 && (
                    <Link
                      to={`/courses?search=${searchQuery}`}
                      className="nav-search-view-all"
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                    >
                      View all {searchResults.length} results
                    </Link>
                  )}
                </>
              ) : (
                <div className="nav-search-no-results">
                  No courses found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <ul className="nav-menu">
          {user ? (
            <>
              <li><Link to="/dashboard" className="nav-button-link">Dashboard</Link></li>
              <li>
                <NestedDropdown
                  categories={categories}
                  loading={categoriesLoading}
                  error={categoriesError}
                />
              </li>
              <li>
                <Link to="/study" className="nav-primary-action">
                  Study
                </Link>
              </li>
              {(user.role === 'admin' || user.role === 'super_admin') && (
                <li><Link to="/admin" className="nav-button-link">Admin</Link></li>
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
