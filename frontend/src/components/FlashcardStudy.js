import React, { useState, useEffect } from 'react';
import { cardsAPI } from '../services/api';
import FlashcardViewer from './FlashcardViewer';
import './FlashcardStudy.css';

const FlashcardStudy = ({ courseId, onClose, compact = false }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    reviewed: 0,
    correct: 0,
    incorrect: 0,
  });
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    loadCards();
  }, [courseId]);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = courseId ? { courseId, limit: 20 } : { limit: 20 };
      const response = await cardsAPI.getDue(params);

      if (response.data.success && response.data.data.cards) {
        const loadedCards = response.data.data.cards;
        setCards(loadedCards);
        setSessionStats(prev => ({
          ...prev,
          total: loadedCards.length,
        }));

        if (loadedCards.length === 0) {
          setSessionComplete(true);
        }
      } else {
        setError('Failed to load flashcards');
      }
    } catch (err) {
      console.error('Error loading cards:', err);
      setError(err.response?.data?.message || 'Failed to load flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (quality) => {
    const currentCard = cards[currentIndex];

    try {
      // Update card with review
      await cardsAPI.update(currentCard.id, {
        quality,
        reviewedAt: new Date().toISOString(),
      });

      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
        incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect,
      }));

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setSessionComplete(true);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to save review. Moving to next card...');

      // Still move to next card even if save failed
      setTimeout(() => {
        setError(null);
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setSessionComplete(true);
        }
      }, 2000);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSessionComplete(false);
    setSessionStats({
      total: cards.length,
      reviewed: 0,
      correct: 0,
      incorrect: 0,
    });
  };

  const handleLoadMore = () => {
    loadCards();
  };

  if (loading) {
    return (
      <div className={`flashcard-study ${compact ? 'compact' : ''}`}>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error && cards.length === 0) {
    return (
      <div className={`flashcard-study ${compact ? 'compact' : ''}`}>
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button onClick={loadCards} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;

    return (
      <div className={`flashcard-study ${compact ? 'compact' : ''}`}>
        <div className="session-complete">
          <div className="completion-icon">🎉</div>
          <h2>Session Complete!</h2>
          <div className="session-summary">
            <div className="stat-item">
              <span className="stat-label">Cards Reviewed</span>
              <span className="stat-value">{sessionStats.reviewed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Correct</span>
              <span className="stat-value correct">{sessionStats.correct}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Need Review</span>
              <span className="stat-value incorrect">{sessionStats.incorrect}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
          </div>
          <div className="completion-actions">
            {sessionStats.total > 0 && (
              <button onClick={handleRestart} className="btn-secondary">
                Review Again
              </button>
            )}
            <button onClick={handleLoadMore} className="btn-primary">
              Load More Cards
            </button>
            {onClose && (
              <button onClick={onClose} className="btn-tertiary">
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = sessionStats.total > 0
    ? Math.round(((sessionStats.reviewed) / sessionStats.total) * 100)
    : 0;

  return (
    <div className={`flashcard-study ${compact ? 'compact' : ''}`}>
      {!compact && onClose && (
        <button onClick={onClose} className="btn-close">
          ✕
        </button>
      )}

      <div className="study-header">
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">
            {sessionStats.reviewed} / {sessionStats.total} cards reviewed
          </div>
        </div>

        <div className="session-stats-mini">
          <span className="stat-mini correct">✓ {sessionStats.correct}</span>
          <span className="stat-mini incorrect">✗ {sessionStats.incorrect}</span>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <FlashcardViewer
        card={currentCard}
        onAnswer={handleAnswer}
      />

      <div className="study-footer">
        <div className="card-counter">
          Card {currentIndex + 1} of {cards.length}
        </div>
      </div>
    </div>
  );
};

export default FlashcardStudy;
