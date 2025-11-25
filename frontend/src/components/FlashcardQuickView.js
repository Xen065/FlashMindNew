import React, { useState, useEffect } from 'react';
import { cardsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import './FlashcardQuickView.css';

const FlashcardQuickView = ({ onStartStudy, compact = true }) => {
  const [dueCards, setDueCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDueCards();
  }, []);

  const loadDueCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await cardsAPI.getDue({ limit: 5 });

      if (response.data.success && response.data.data.cards) {
        setDueCards(response.data.data.cards);
      }
    } catch (err) {
      console.error('Error loading due cards:', err);
      setError('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudy = () => {
    if (onStartStudy) {
      onStartStudy();
    }
  };

  if (loading) {
    return (
      <div className="flashcard-quick-view">
        <div className="loading-mini">
          <div className="spinner-mini"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-quick-view">
        <div className="error-mini">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-quick-view">
      {dueCards.length === 0 ? (
        <div className="no-cards-message">
          <div className="icon-large">✅</div>
          <p className="message-text">All caught up!</p>
          <p className="message-subtext">No cards due for review</p>
          <Link to="/courses" className="btn-browse-courses">
            Browse Courses
          </Link>
        </div>
      ) : (
        <>
          <div className="cards-due-summary">
            <div className="due-count">
              <span className="count-number">{dueCards.length}</span>
              <span className="count-label">cards due</span>
            </div>
            {dueCards.slice(0, 3).map((card, index) => (
              <div key={card.id} className="preview-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="preview-icon">
                  {card.course?.icon || '📚'}
                </div>
                <div className="preview-info">
                  <div className="preview-course">{card.course?.title || 'Unknown Course'}</div>
                  <div className="preview-question">{card.question}</div>
                </div>
              </div>
            ))}
            {dueCards.length > 3 && (
              <div className="more-cards">
                + {dueCards.length - 3} more
              </div>
            )}
          </div>

          <button onClick={handleStartStudy} className="btn-start-study">
            <span className="btn-icon">🚀</span>
            <span className="btn-text">Study</span>
          </button>
        </>
      )}
    </div>
  );
};

export default FlashcardQuickView;
