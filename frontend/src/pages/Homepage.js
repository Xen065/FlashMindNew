import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../config';
import './Homepage.css';

const Homepage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const features = [
    {
      icon: '🧠',
      title: 'Smart Spaced Repetition',
      description: 'Our SM-2 algorithm schedules your reviews at optimal intervals for maximum retention and long-term memory.'
    },
    {
      icon: '🎮',
      title: 'Gamified Learning',
      description: 'Earn XP, level up, collect coins, build streaks, and unlock achievements as you study. Learning meets gaming.'
    },
    {
      icon: '🎯',
      title: '8 Card Types',
      description: 'Master any subject with basic flashcards, multiple choice, cloze deletion, image occlusion, matching pairs, and more.'
    },
    {
      icon: '⚡',
      title: 'Math Tricks & Exam Prep',
      description: 'Speed arithmetic, mental math shortcuts, and competitive exam simulations with leaderboards and timed challenges.'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Track your progress with detailed statistics, performance charts, accuracy metrics, and study time insights.'
    },
    {
      icon: '📚',
      title: 'Study Tools Suite',
      description: 'Pomodoro timer, study planner, exam reminders, note-taking, and task management—all in one place.'
    }
  ];

  const studyModes = [
    {
      icon: '🔥',
      mode: 'Intensive',
      description: 'Perfect for cramming before exams with frequent review intervals'
    },
    {
      icon: '⚖️',
      mode: 'Normal',
      description: 'Balanced approach for steady progress and consistent learning'
    },
    {
      icon: '🌱',
      mode: 'Relaxed',
      description: 'Long-term retention with spaced-out reviews for lasting knowledge'
    }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setSearchError(null);
      const response = await axios.get(`${config.apiUrl}/api/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data.data?.courses || []);
    } catch (error) {
      console.error('Error searching courses:', error);
      setSearchError(error.response?.data?.message || 'Failed to search courses. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchError(null);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome to FlashMind</h1>
            <p className="hero-subtitle">Master Any Subject with Science-Backed Spaced Repetition</p>
            <p className="hero-description">
              Transform the way you learn with intelligent flashcards, gamification, and powerful study tools designed for students and lifelong learners.
            </p>

            {/* Search Bar */}
            <div className="homepage-search-container">
              <form onSubmit={handleSearch} className="homepage-search-form">
                <div className="homepage-search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search for courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="homepage-search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="homepage-search-clear"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button type="submit" className="homepage-search-button" disabled={searching}>
                  {searching ? '...' : '🔍 Search'}
                </button>
              </form>
            </div>

            <div className="cta-buttons">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-secondary">
                    Login
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-front">🧠</div>
              <div className="card-label">Smart Learning</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-front">📊</div>
              <div className="card-label">Track Progress</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-front">🎯</div>
              <div className="card-label">Achieve Goals</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      {searchResults !== null && (
        <section className="search-results-section">
          <div className="container">
            <div className="search-results-header">
              <h2>Search Results for "{searchQuery}"</h2>
              <button onClick={clearSearch} className="btn btn-secondary btn-small">
                Clear Search
              </button>
            </div>

            {searchError && (
              <div className="search-error">
                <p>{searchError}</p>
              </div>
            )}

            {!searchError && searchResults.length === 0 && (
              <div className="search-empty">
                <div className="empty-icon">🔍</div>
                <h3>No courses found</h3>
                <p>Try searching with different keywords</p>
              </div>
            )}

            {!searchError && searchResults.length > 0 && (
              <div className="search-results-grid">
                {searchResults.map((course) => (
                  <div key={course.id} className="search-result-card">
                    <h3>{course.title}</h3>
                    <p>{course.description || 'No description available'}</p>

                    {(course.difficulty || course.cardCount) && (
                      <div className="course-meta">
                        {course.difficulty && (
                          <span className="meta-item">
                            <span className="icon">📊</span>
                            {course.difficulty}
                          </span>
                        )}
                        {course.cardCount && (
                          <span className="meta-item">
                            <span className="icon">🎴</span>
                            {course.cardCount} cards
                          </span>
                        )}
                      </div>
                    )}

                    <Link to={`/courses/${course.id}`} className="btn btn-primary">
                      View Course
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Everything You Need to Excel</h2>
          <p className="section-subtitle">Powerful features designed to accelerate your learning journey</p>

          <div className="bento-grid">
            {features.map((feature, index) => (
              <div key={index} className={`bento-card bento-card-${index + 1}`}>
                <div className="bento-icon-wrapper">
                  <div className="feature-icon">{feature.icon}</div>
                </div>
                <div className="bento-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Modes Section */}
      <section className="modes-section">
        <div className="container">
          <h2 className="section-title">Choose Your Study Pace</h2>
          <p className="section-subtitle">Customize your learning frequency to match your goals</p>

          <div className="timeline-container">
            <div className="timeline-line"></div>
            {studyModes.map((mode, index) => (
              <div key={index} className={`timeline-card timeline-${index + 1}`}>
                <div className="timeline-milestone">
                  <div className="milestone-icon">{mode.icon}</div>
                </div>
                <div className="timeline-content">
                  <h3 className="mode-name">{mode.mode}</h3>
                  <p className="mode-description">{mode.description}</p>
                </div>
                {index < studyModes.length - 1 && <div className="timeline-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-flow">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">📚</div>
              <div className="step-content">
                <h3 className="step-title">Browse Courses</h3>
                <p className="step-description">Choose from a variety of courses or create your own custom decks</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">🧠</div>
              <div className="step-content">
                <h3 className="step-title">Study Smart</h3>
                <p className="step-description">Our algorithm shows you cards at the perfect time for maximum retention</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">📈</div>
              <div className="step-content">
                <h3 className="step-title">Track Progress</h3>
                <p className="step-description">Monitor your growth with detailed analytics and achievement unlocks</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-icon">🏆</div>
              <div className="step-content">
                <h3 className="step-title">Master Content</h3>
                <p className="step-description">Achieve long-term retention and ace your exams with confidence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">8</div>
              <div className="stat-label">Card Types</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">10+</div>
              <div className="stat-label">Math Trick Topics</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">∞</div>
              <div className="stat-label">Courses Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Study Anytime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="cta-section">
          <div className="container">
            <h2 className="cta-title">Ready to Transform Your Learning?</h2>
            <p className="cta-description">Join thousands of students mastering subjects with spaced repetition</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Learning Today
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Homepage;
