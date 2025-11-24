import React, { useState } from 'react';
import './FlashcardViewer.css';

const FlashcardViewer = ({ card, onAnswer, showAnswer: initialShowAnswer = false }) => {
  const [showAnswer, setShowAnswer] = useState(initialShowAnswer);

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  const handleQualityAnswer = (quality) => {
    if (onAnswer) {
      onAnswer(quality);
    }
    // Reset for next card
    setShowAnswer(false);
  };

  if (!card) {
    return (
      <div className="flashcard-viewer">
        <div className="no-card-message">
          <p>No card to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-viewer">
      <div className={`flashcard ${showAnswer ? 'flipped' : ''}`} onClick={handleFlip}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <div className="card-type-badge">{card.cardType || 'basic'}</div>
            <div className="card-content">
              <h3 className="card-label">Question</h3>
              <p className="card-text">{card.question}</p>
              {card.hint && !showAnswer && (
                <div className="card-hint">
                  <span className="hint-label">💡 Hint:</span> {card.hint}
                </div>
              )}
            </div>
            <div className="flip-instruction">Click to reveal answer</div>
          </div>

          <div className="flashcard-back">
            <div className="card-content">
              <h3 className="card-label">Answer</h3>
              <p className="card-text">{card.answer}</p>
              {card.explanation && (
                <div className="card-explanation">
                  <span className="explanation-label">📝 Explanation:</span>
                  <p>{card.explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAnswer && (
        <div className="answer-buttons">
          <p className="answer-prompt">How well did you know this?</p>
          <div className="quality-buttons">
            <button
              className="quality-btn quality-1"
              onClick={() => handleQualityAnswer(1)}
              title="Didn't know at all"
            >
              <span className="quality-icon">😞</span>
              <span className="quality-label">Again</span>
            </button>
            <button
              className="quality-btn quality-2"
              onClick={() => handleQualityAnswer(2)}
              title="Barely knew it"
            >
              <span className="quality-icon">😐</span>
              <span className="quality-label">Hard</span>
            </button>
            <button
              className="quality-btn quality-3"
              onClick={() => handleQualityAnswer(3)}
              title="Knew it with some effort"
            >
              <span className="quality-icon">🙂</span>
              <span className="quality-label">Good</span>
            </button>
            <button
              className="quality-btn quality-4"
              onClick={() => handleQualityAnswer(4)}
              title="Knew it easily"
            >
              <span className="quality-icon">😄</span>
              <span className="quality-label">Easy</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardViewer;
