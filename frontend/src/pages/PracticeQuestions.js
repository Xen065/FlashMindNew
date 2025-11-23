import React from 'react';
import { useParams } from 'react-router-dom';

const PracticeQuestions = () => {
  const { id } = useParams();

  return (
    <div className="practice-page">
      <h1>Practice Questions</h1>
      <p>Practice mode for course {id} coming soon!</p>
    </div>
  );
};

export default PracticeQuestions;
