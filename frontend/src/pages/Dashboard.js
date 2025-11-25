import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.username}!</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Your Progress</h3>
          <p>Level: {user?.level || 1}</p>
          <p>XP: {user?.experiencePoints || 0}</p>
          <p>Streak: {user?.currentStreak || 0} days</p>
        </div>
        <div className="dashboard-card">
          <h3>Quick Stats</h3>
          <p>Study to see your progress here!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
