import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FlashcardStudy from '../components/FlashcardStudy';
import { isFeatureEnabled } from '../config';
import './PracticeQuestions.css';

const PracticeQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const flashcardsEnabled = isFeatureEnabled('flashcards');

  const handleClose = () => {
    navigate(`/courses/${id}`);
  };

  if (!flashcardsEnabled) {
    return (
      <div className="practice-page">
        <div className="practice-container">
          <h1>Practice Questions</h1>
          <p>Practice mode is currently disabled.</p>
          <button onClick={handleClose} className="btn-back-to-course">
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-page">
      <div className="practice-container">
        <div className="practice-header">
          <h1>Practice Session</h1>
          <button onClick={handleClose} className="btn-back-to-course">
            ← Back to Course
          </button>
        </div>
        <FlashcardStudy courseId={id} onClose={handleClose} />
      </div>
    </div>
  );
};

export default PracticeQuestions;
