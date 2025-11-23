import React, { useState, useEffect, useRef } from 'react';
import { pomodoroAPI } from '../services/api';
import './PomodoroTimer.css';

const TIMER_MODES = {
  pomodoro: { work: 25, break: 5, longBreak: 15 },
  custom: { work: 30, break: 10, longBreak: 20 },
  focus: { work: 50, break: 10, longBreak: 30 },
};

function PomodoroTimer({ courseId = null, compact = false }) {
  const [mode, setMode] = useState('pomodoro');
  const [phase, setPhase] = useState('work'); // 'work' or 'break'
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.pomodoro.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Load active session on mount
  useEffect(() => {
    loadActiveSession();
    loadStats();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const loadActiveSession = async () => {
    try {
      const response = await pomodoroAPI.getActive();
      if (response.data.hasActiveSession) {
        const session = response.data.session;
        const timerData = response.data.timerData || {};

        setSessionId(session.id);
        setPomodorosCompleted(timerData.pomodorosCompleted || 0);
        setPhase(timerData.currentPhase || 'work');

        // Calculate remaining time
        const startTime = new Date(session.startTime);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const duration = timerData.currentPhase === 'work'
          ? (timerData.workDuration || 25) * 60
          : (timerData.breakDuration || 5) * 60;
        const remaining = Math.max(0, duration - (elapsed % duration));

        setTimeLeft(remaining);
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await pomodoroAPI.getStats({ period: 'today' });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const startSession = async () => {
    try {
      setLoading(true);
      const workDuration = mode === 'custom' ? customWork : TIMER_MODES[mode].work;
      const breakDuration = mode === 'custom' ? customBreak : TIMER_MODES[mode].break;

      const response = await pomodoroAPI.start({
        courseId,
        timerMode: mode,
        workDuration,
        breakDuration,
        focusMode: false,
      });

      setSessionId(response.data.session.id);
      setTimeLeft(workDuration * 60);
      setPhase('work');
      setIsRunning(true);
      setPomodorosCompleted(0);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resumeSession = () => {
    setIsRunning(true);
  };

  const handlePhaseComplete = async () => {
    setIsRunning(false);
    playSound();

    if (phase === 'work') {
      const newCount = pomodorosCompleted + 1;
      setPomodorosCompleted(newCount);

      // Update backend
      if (sessionId) {
        try {
          await pomodoroAPI.update(sessionId, {
            pomodorosCompleted: newCount,
            currentPhase: 'break',
          });
        } catch (error) {
          console.error('Error updating session:', error);
        }
      }

      // Switch to break
      const breakDuration = newCount % 4 === 0
        ? TIMER_MODES[mode].longBreak
        : (mode === 'custom' ? customBreak : TIMER_MODES[mode].break);

      setPhase('break');
      setTimeLeft(breakDuration * 60);

      // Auto-start break
      setTimeout(() => setIsRunning(true), 2000);
    } else {
      // Break complete, switch to work
      if (sessionId) {
        try {
          await pomodoroAPI.update(sessionId, {
            currentPhase: 'work',
          });
        } catch (error) {
          console.error('Error updating session:', error);
        }
      }

      const workDuration = mode === 'custom' ? customWork : TIMER_MODES[mode].work;
      setPhase('work');
      setTimeLeft(workDuration * 60);

      // Auto-start work phase
      setTimeout(() => setIsRunning(true), 2000);
    }
  };

  const completeSession = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await pomodoroAPI.complete(sessionId, {
        pomodorosCompleted,
        actualDuration: pomodorosCompleted * (mode === 'custom' ? customWork : TIMER_MODES[mode].work) * 60,
      });

      alert(`Session complete! You earned ${response.data.rewards.xp} XP and ${response.data.rewards.coins} coins! 🎉`);

      // Reset state
      setSessionId(null);
      setIsRunning(false);
      setPomodorosCompleted(0);
      setPhase('work');
      setTimeLeft(TIMER_MODES[mode].work * 60);

      // Reload stats
      loadStats();
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Failed to complete session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelSession = async () => {
    if (!sessionId) return;

    if (!window.confirm('Are you sure you want to cancel this session? Progress will be lost.')) {
      return;
    }

    try {
      await pomodoroAPI.cancel(sessionId);
      setSessionId(null);
      setIsRunning(false);
      setPomodorosCompleted(0);
      setPhase('work');
      setTimeLeft(TIMER_MODES[mode].work * 60);
    } catch (error) {
      console.error('Error cancelling session:', error);
    }
  };

  const playSound = () => {
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: phase === 'work' ? 'Work session complete! Time for a break.' : 'Break is over! Time to focus.',
        icon: '/favicon.ico',
      });
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    const totalDuration = phase === 'work'
      ? (mode === 'custom' ? customWork : TIMER_MODES[mode].work) * 60
      : (mode === 'custom' ? customBreak : TIMER_MODES[mode].break) * 60;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  if (compact) {
    return (
      <div className="pomodoro-compact">
        <div className="pomodoro-compact-display">
          <span className="pomodoro-phase-icon">{phase === 'work' ? '🍅' : '☕'}</span>
          <span className="pomodoro-time">{formatTime(timeLeft)}</span>
          <span className="pomodoro-count">×{pomodorosCompleted}</span>
        </div>
        {!sessionId ? (
          <button className="btn-pomodoro-start-compact" onClick={startSession} disabled={loading}>
            Start
          </button>
        ) : (
          <button
            className="btn-pomodoro-toggle-compact"
            onClick={isRunning ? pauseSession : resumeSession}
          >
            {isRunning ? '⏸' : '▶'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pomodoro-timer">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <div className="pomodoro-header">
        <h3>🍅 Pomodoro Timer</h3>
        <button
          className="btn-pomodoro-settings"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {showSettings && !sessionId && (
        <div className="pomodoro-settings">
          <div className="setting-row">
            <label>Mode:</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="pomodoro">Classic Pomodoro (25/5)</option>
              <option value="custom">Custom Timer</option>
              <option value="focus">Deep Focus (50/10)</option>
            </select>
          </div>

          {mode === 'custom' && (
            <>
              <div className="setting-row">
                <label>Work Duration (min):</label>
                <input
                  type="number"
                  value={customWork}
                  onChange={(e) => setCustomWork(Number(e.target.value))}
                  min="1"
                  max="120"
                />
              </div>
              <div className="setting-row">
                <label>Break Duration (min):</label>
                <input
                  type="number"
                  value={customBreak}
                  onChange={(e) => setCustomBreak(Number(e.target.value))}
                  min="1"
                  max="60"
                />
              </div>
            </>
          )}

          <button className="btn-notify" onClick={requestNotificationPermission}>
            Enable Notifications
          </button>
        </div>
      )}

      <div className={`pomodoro-display ${phase}`}>
        <div className="pomodoro-phase">
          {phase === 'work' ? '🍅 Focus Time' : '☕ Break Time'}
        </div>

        <div className="pomodoro-timer-circle">
          <svg className="progress-ring" width="200" height="200">
            <circle
              className="progress-ring-bg"
              cx="100"
              cy="100"
              r="90"
              strokeWidth="10"
              fill="none"
            />
            <circle
              className="progress-ring-progress"
              cx="100"
              cy="100"
              r="90"
              strokeWidth="10"
              fill="none"
              strokeDasharray="565.48"
              strokeDashoffset={565.48 - (565.48 * getProgressPercent()) / 100}
            />
          </svg>
          <div className="timer-text">{formatTime(timeLeft)}</div>
        </div>

        <div className="pomodoro-stats-row">
          <div className="stat-item">
            <span className="stat-label">Pomodoros</span>
            <span className="stat-value">{pomodorosCompleted}</span>
          </div>
        </div>
      </div>

      <div className="pomodoro-controls">
        {!sessionId ? (
          <button
            className="btn-pomodoro-start"
            onClick={startSession}
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start Session'}
          </button>
        ) : (
          <>
            <button
              className="btn-pomodoro-toggle"
              onClick={isRunning ? pauseSession : resumeSession}
            >
              {isRunning ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button className="btn-pomodoro-complete" onClick={completeSession} disabled={loading}>
              ✓ Complete
            </button>
            <button className="btn-pomodoro-cancel" onClick={cancelSession}>
              ✕ Cancel
            </button>
          </>
        )}
      </div>

      {stats && (
        <div className="pomodoro-today-stats">
          <h4>Today's Progress</h4>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-value">{stats.totalPomodoros || 0}</span>
              <span className="stat-label">Pomodoros</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.totalMinutes || 0}</span>
              <span className="stat-label">Minutes</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.totalSessions || 0}</span>
              <span className="stat-label">Sessions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PomodoroTimer;
