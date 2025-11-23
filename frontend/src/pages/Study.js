import React, { useState } from 'react';
import PomodoroTimer from '../components/PomodoroTimer';
import TodoList from '../components/TodoList';
import StudyNotes from '../components/StudyNotes';
import StudyCalendar from '../components/StudyCalendar';
import MathTrick from '../components/MathTrick';
import './Study.css';

const Study = () => {
  const [showMathTrick, setShowMathTrick] = useState(false);
  const [activeView, setActiveView] = useState('grid'); // 'grid' or 'focus'
  const [focusComponent, setFocusComponent] = useState(null);

  const handleFocusView = (component) => {
    setFocusComponent(component);
    setActiveView('focus');
  };

  const handleGridView = () => {
    setActiveView('grid');
    setFocusComponent(null);
  };

  if (activeView === 'focus' && focusComponent) {
    return (
      <div className="study-page focus-mode">
        <div className="focus-header">
          <button onClick={handleGridView} className="btn-back">
            ← Back to Overview
          </button>
          <h2>{focusComponent === 'pomodoro' && '🍅 Pomodoro Timer'}
              {focusComponent === 'todo' && '📝 Todo List'}
              {focusComponent === 'notes' && '📝 Study Notes'}
              {focusComponent === 'calendar' && '📅 Calendar'}</h2>
        </div>
        <div className="focus-content">
          {focusComponent === 'pomodoro' && <PomodoroTimer />}
          {focusComponent === 'todo' && <TodoList />}
          {focusComponent === 'notes' && <StudyNotes />}
          {focusComponent === 'calendar' && <StudyCalendar />}
        </div>
      </div>
    );
  }

  return (
    <div className="study-page">
      <div className="study-header">
        <div>
          <h1>Study Session</h1>
          <p className="study-subtitle">Manage your study time, tasks, notes, and schedule</p>
        </div>
        <button
          className="btn-math-trick"
          onClick={() => setShowMathTrick(true)}
        >
          🧮 Math Trick Practice
        </button>
      </div>

      <div className="study-grid">
        {/* Pomodoro Timer - Top Left */}
        <div className="study-card pomodoro-section">
          <div className="card-header">
            <span>🍅 Pomodoro Timer</span>
            <button
              onClick={() => handleFocusView('pomodoro')}
              className="btn-expand"
              title="Expand"
            >
              ⛶
            </button>
          </div>
          <PomodoroTimer />
        </div>

        {/* Calendar - Top Right */}
        <div className="study-card calendar-section">
          <div className="card-header">
            <span>📅 Calendar & Events</span>
            <button
              onClick={() => handleFocusView('calendar')}
              className="btn-expand"
              title="Expand"
            >
              ⛶
            </button>
          </div>
          <StudyCalendar compact />
        </div>

        {/* Todo List - Bottom Left */}
        <div className="study-card todo-section">
          <div className="card-header">
            <span>📝 Todo List</span>
            <button
              onClick={() => handleFocusView('todo')}
              className="btn-expand"
              title="Expand"
            >
              ⛶
            </button>
          </div>
          <div className="card-content">
            <TodoList compact />
          </div>
        </div>

        {/* Notes - Bottom Right */}
        <div className="study-card notes-section">
          <div className="card-header">
            <span>📝 Quick Notes</span>
            <button
              onClick={() => handleFocusView('notes')}
              className="btn-expand"
              title="Expand"
            >
              ⛶
            </button>
          </div>
          <div className="card-content">
            <StudyNotes compact />
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="quick-actions">
        <button className="action-btn" onClick={() => setShowMathTrick(true)}>
          <span className="action-icon">🧮</span>
          <span className="action-label">Math Practice</span>
        </button>
        <button className="action-btn" onClick={() => handleFocusView('pomodoro')}>
          <span className="action-icon">⏱️</span>
          <span className="action-label">Start Timer</span>
        </button>
        <button className="action-btn" onClick={() => handleFocusView('todo')}>
          <span className="action-icon">✓</span>
          <span className="action-label">Add Task</span>
        </button>
        <button className="action-btn" onClick={() => handleFocusView('notes')}>
          <span className="action-icon">📝</span>
          <span className="action-label">New Note</span>
        </button>
      </div>

      {/* Math Trick Modal */}
      {showMathTrick && <MathTrick onClose={() => setShowMathTrick(false)} />}
    </div>
  );
};

export default Study;
