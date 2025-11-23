/**
 * ============================================
 * Frontend Configuration
 * ============================================
 * Centralized configuration for the FlashMind frontend
 */

const config = {
  // API Base URL - reads from environment variable
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',

  // Application Info
  appName: process.env.REACT_APP_NAME || 'FlashMind',
  appVersion: process.env.REACT_APP_VERSION || '1.0.0',

  // API Endpoints
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      me: '/api/auth/me',
      logout: '/api/auth/logout',
    },
    users: '/api/users',
    courses: '/api/courses',
    cards: '/api/cards',
    study: '/api/study',
    stats: '/api/stats',
    achievements: '/api/achievements',
    admin: '/api/admin',
    calendar: '/api/calendar',
    goals: '/api/study/goals',
    tasks: '/api/study/tasks',
    exams: '/api/study/exams',
    notes: '/api/study/notes',
    pomodoro: '/api/pomodoro',
    analytics: '/api/analytics',
    mathTrick: '/api/math-trick',
  },

  // Feature Flags
  features: {
    registration: process.env.REACT_APP_ENABLE_REGISTRATION !== 'false',
    socialLogin: process.env.REACT_APP_ENABLE_SOCIAL_LOGIN === 'true',
    darkMode: process.env.REACT_APP_ENABLE_DARK_MODE !== 'false',

    // Study features - can be toggled individually
    pomodoroTimer: process.env.REACT_APP_ENABLE_POMODORO !== 'false',
    todoList: process.env.REACT_APP_ENABLE_TODO_LIST !== 'false',
    studyNotes: process.env.REACT_APP_ENABLE_STUDY_NOTES !== 'false',
    studyCalendar: process.env.REACT_APP_ENABLE_STUDY_CALENDAR !== 'false',
    mathTrick: process.env.REACT_APP_ENABLE_MATH_TRICK !== 'false',
  },

  // App Settings
  settings: {
    itemsPerPage: 20,
    sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  if (!endpoint) return config.apiUrl;
  return `${config.apiUrl}${endpoint}`;
};

// Helper function to check if feature is enabled
export const isFeatureEnabled = (featureName) => {
  return config.features[featureName] || false;
};

export default config;
