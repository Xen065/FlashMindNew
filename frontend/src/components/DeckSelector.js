import React, { useState, useEffect } from 'react';
import { coursesAPI, cardsAPI } from '../services/api';
import './DeckSelector.css';

const DeckSelector = ({ onSelect, onClose }) => {
  const [courses, setCourses] = useState([]);
  const [coursesWithCards, setCoursesWithCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all courses
      const coursesResponse = await coursesAPI.getAll();
      const allCourses = coursesResponse.data.data?.courses || [];
      setCourses(allCourses);

      // Load all user's cards to count cards per course
      const cardsResponse = await cardsAPI.getAll({ limit: 1000 });
      const allCards = cardsResponse.data.data?.cards || [];

      // Count cards per course
      const cardCounts = allCards.reduce((acc, card) => {
        acc[card.courseId] = (acc[card.courseId] || 0) + 1;
        return acc;
      }, {});

      // Count due cards per course
      const dueCardsResponse = await cardsAPI.getDue({ limit: 1000 });
      const dueCards = dueCardsResponse.data.data?.cards || [];

      const dueCounts = dueCards.reduce((acc, card) => {
        acc[card.courseId] = (acc[card.courseId] || 0) + 1;
        return acc;
      }, {});

      // Combine course info with card counts
      const enrichedCourses = allCourses.map(course => ({
        ...course,
        totalCards: cardCounts[course.id] || 0,
        dueCards: dueCounts[course.id] || 0,
      }));

      setCoursesWithCards(enrichedCourses);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (courseId) => {
    if (onSelect) {
      onSelect(courseId);
    }
  };

  const handleSelectAll = () => {
    if (onSelect) {
      onSelect(null); // null means all courses
    }
  };

  if (loading) {
    return (
      <div className="deck-selector">
        <div className="selector-header">
          <h2>Select a Deck</h2>
          {onClose && (
            <button onClick={onClose} className="btn-close">
              ✕
            </button>
          )}
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your decks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deck-selector">
        <div className="selector-header">
          <h2>Select a Deck</h2>
          {onClose && (
            <button onClick={onClose} className="btn-close">
              ✕
            </button>
          )}
        </div>
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button onClick={loadCourses} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalDueCards = coursesWithCards.reduce((sum, c) => sum + c.dueCards, 0);

  return (
    <div className="deck-selector">
      <div className="selector-header">
        <h2>Select a Deck to Study</h2>
        {onClose && (
          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        )}
      </div>

      <div className="deck-list">
        {/* All Decks Option */}
        <div
          className="deck-card all-decks"
          onClick={handleSelectAll}
        >
          <div className="deck-icon">🎯</div>
          <div className="deck-info">
            <h3 className="deck-title">All Decks</h3>
            <p className="deck-description">Study cards from all your courses</p>
            <div className="deck-stats">
              <span className="stat due">{totalDueCards} due</span>
            </div>
          </div>
        </div>

        {coursesWithCards.length === 0 ? (
          <div className="no-decks-message">
            <p>No courses found. Enroll in a course to start studying!</p>
          </div>
        ) : (
          coursesWithCards.map((course) => (
            <div
              key={course.id}
              className={`deck-card ${course.dueCards === 0 ? 'no-due' : ''}`}
              onClick={() => handleSelectCourse(course.id)}
            >
              <div className="deck-icon" style={{ background: course.color || '#667eea' }}>
                {course.icon || '📚'}
              </div>
              <div className="deck-info">
                <h3 className="deck-title">{course.title}</h3>
                {course.description && (
                  <p className="deck-description">{course.description}</p>
                )}
                <div className="deck-stats">
                  {course.dueCards > 0 ? (
                    <span className="stat due">{course.dueCards} due</span>
                  ) : (
                    <span className="stat none">No cards due</span>
                  )}
                  <span className="stat total">{course.totalCards} total</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeckSelector;
