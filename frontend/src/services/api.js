/**
 * ============================================
 * API Service Layer
 * ============================================
 * Centralized API communication for FlashMind frontend
 */

import axios from 'axios';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * ============================================
 * POMODORO / TIMER API
 * ============================================
 */
export const pomodoroAPI = {
  // Start a new pomodoro session
  start: (sessionData) => api.post(config.endpoints.pomodoro + '/start', sessionData),

  // Update session progress
  update: (sessionId, updateData) => api.put(`${config.endpoints.pomodoro}/${sessionId}/update`, updateData),

  // Complete a session
  complete: (sessionId, completionData) => api.post(`${config.endpoints.pomodoro}/${sessionId}/complete`, completionData),

  // Cancel a session
  cancel: (sessionId) => api.post(`${config.endpoints.pomodoro}/${sessionId}/cancel`),

  // Get active session
  getActive: () => api.get(config.endpoints.pomodoro + '/active'),

  // Get session history
  getHistory: (params = {}) => api.get(config.endpoints.pomodoro + '/history', { params }),

  // Get statistics
  getStats: (params = {}) => api.get(config.endpoints.pomodoro + '/stats', { params }),
};

/**
 * ============================================
 * CALENDAR API
 * ============================================
 */
export const calendarAPI = {
  // Get all events for a date range
  getEvents: (params = {}) => api.get(config.endpoints.calendar + '/events', { params }),

  // Get events for a specific day
  getDayEvents: (date) => api.get(`${config.endpoints.calendar}/events/day/${date}`),

  // Get calendar summary (overdue, upcoming, etc.)
  getSummary: () => api.get(config.endpoints.calendar + '/summary'),
};

/**
 * ============================================
 * STUDY NOTES API
 * ============================================
 */
export const notesAPI = {
  // Get all notes
  getAll: (params = {}) => api.get(config.endpoints.notes, { params }),

  // Get single note
  getById: (noteId) => api.get(`${config.endpoints.notes}/${noteId}`),

  // Create new note
  create: (noteData) => api.post(config.endpoints.notes, noteData),

  // Update note
  update: (noteId, noteData) => api.put(`${config.endpoints.notes}/${noteId}`, noteData),

  // Delete note
  delete: (noteId) => api.delete(`${config.endpoints.notes}/${noteId}`),

  // Search notes
  search: (searchData) => api.post(config.endpoints.notes + '/search', searchData),

  // Toggle pin
  togglePin: (noteId) => api.post(`${config.endpoints.notes}/${noteId}/pin`),

  // Toggle favorite
  toggleFavorite: (noteId) => api.post(`${config.endpoints.notes}/${noteId}/favorite`),

  // Toggle archive
  toggleArchive: (noteId) => api.post(`${config.endpoints.notes}/${noteId}/archive`),

  // Get folders
  getFolders: () => api.get(config.endpoints.notes + '/meta/folders'),

  // Get tags
  getTags: () => api.get(config.endpoints.notes + '/meta/tags'),

  // Get statistics
  getStats: () => api.get(config.endpoints.notes + '/stats/summary'),
};

/**
 * ============================================
 * STUDY TASKS (TODO LIST) API
 * ============================================
 */
export const tasksAPI = {
  // Get all tasks
  getAll: (params = {}) => api.get(config.endpoints.tasks, { params }),

  // Get single task
  getById: (taskId) => api.get(`${config.endpoints.tasks}/${taskId}`),

  // Create new task
  create: (taskData) => api.post(config.endpoints.tasks, taskData),

  // Update task
  update: (taskId, taskData) => api.put(`${config.endpoints.tasks}/${taskId}`, taskData),

  // Delete task
  delete: (taskId) => api.delete(`${config.endpoints.tasks}/${taskId}`),

  // Mark task as complete
  complete: (taskId) => api.post(`${config.endpoints.tasks}/${taskId}/complete`),
};

/**
 * ============================================
 * MATH TRICK API
 * ============================================
 */
export const mathTrickAPI = {
  // Get user progress
  getProgress: () => api.get(config.endpoints.mathTrick + '/progress'),

  // Get questions for a topic
  getQuestions: (topic, level, count) =>
    api.post(config.endpoints.mathTrick + '/questions', { topic, level, count }),

  // Submit game results
  submitGame: (gameData) => api.post(config.endpoints.mathTrick + '/submit', gameData),

  // Get leaderboard
  getLeaderboard: (params = {}) => api.get(config.endpoints.mathTrick + '/leaderboard', { params }),

  // Get achievements
  getAchievements: () => api.get(config.endpoints.mathTrick + '/achievements'),

  // Get analytics
  getAnalytics: () => api.get(config.endpoints.mathTrick + '/analytics'),
};

/**
 * ============================================
 * COURSES API (existing but included for completeness)
 * ============================================
 */
export const coursesAPI = {
  getAll: () => api.get(config.endpoints.courses),
  getById: (id) => api.get(`${config.endpoints.courses}/${id}`),
  create: (data) => api.post(config.endpoints.courses, data),
  update: (id, data) => api.put(`${config.endpoints.courses}/${id}`, data),
  delete: (id) => api.delete(`${config.endpoints.courses}/${id}`),
};

/**
 * ============================================
 * FLASHCARDS / CARDS API
 * ============================================
 */
export const cardsAPI = {
  // Get all user's cards
  getAll: (params = {}) => api.get(config.endpoints.cards, { params }),

  // Get cards due for review
  getDue: (params = {}) => api.get(`${config.endpoints.cards}/due`, { params }),

  // Get single card
  getById: (cardId) => api.get(`${config.endpoints.cards}/${cardId}`),

  // Create new card
  create: (cardData) => api.post(config.endpoints.cards, cardData),

  // Update card
  update: (cardId, cardData) => api.put(`${config.endpoints.cards}/${cardId}`, cardData),

  // Delete card (soft delete)
  delete: (cardId) => api.delete(`${config.endpoints.cards}/${cardId}`),

  // Submit card review (for spaced repetition)
  review: (cardId, reviewData) => api.post(`${config.endpoints.cards}/${cardId}/review`, reviewData),
};

/**
 * ============================================
 * STUDY SESSIONS API
 * ============================================
 */
export const studyAPI = {
  // Get study sessions
  getSessions: (params = {}) => api.get(config.endpoints.study + '/sessions', { params }),

  // Get study statistics
  getStats: (params = {}) => api.get(config.endpoints.study + '/stats', { params }),
};

// Export default API instance for custom requests
export default api;
