import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Homepage = () => {
  const { user } = useAuth();

  return (
    <div className="homepage">
      <div className="hero">
        <h1>Welcome to FlashMind</h1>
        <p>Master any subject with spaced repetition learning</p>
        {!user && (
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        )}
        {user && (
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        )}
      </div>
    </div>
  );
};

export default Homepage;
