# Study Features - User Guide

## Overview

The Study Page is an integrated workspace that brings together essential study tools in one place. All features work together seamlessly while maintaining individual focus modes for deep work.

## Features

### 1. 🍅 Pomodoro Timer

A productivity timer using the Pomodoro Technique to help maintain focus during study sessions.

**Features:**
- **Timer Modes:**
  - Classic Pomodoro (25min work / 5min break)
  - Custom Timer (set your own durations)
  - Deep Focus (50min work / 10min break)
- **Session Tracking:**
  - Counts completed pomodoros
  - Tracks total study time
  - Awards XP and coins on completion
  - Updates user streak
- **Smart Breaks:**
  - Automatically cycles between work and break
  - Long break every 4 pomodoros
  - Audio and browser notifications
- **Statistics:**
  - Today's pomodoros completed
  - Total study time
  - Average session length

**Usage:**
1. Click "Start Session" to begin
2. Timer will count down from work duration
3. Take breaks when prompted
4. Click "Complete" to finish and earn rewards
5. Or "Cancel" to abandon session

**API Endpoints:**
- `POST /api/pomodoro/start` - Start new session
- `PUT /api/pomodoro/:id/update` - Update session progress
- `POST /api/pomodoro/:id/complete` - Complete session
- `GET /api/pomodoro/active` - Get active session
- `GET /api/pomodoro/stats` - Get statistics

---

### 2. ✅ Todo List (Study Tasks)

Manage study-related tasks with priorities, due dates, and progress tracking.

**Features:**
- **Task Management:**
  - Create, edit, delete tasks
  - Mark tasks as complete
  - Set due dates
  - Estimate time duration
- **Organization:**
  - 4 priority levels (low, medium, high, urgent)
  - Filter by status and priority
  - Show/hide completed tasks
  - Automatic sorting by priority and date
- **Visual Cues:**
  - Color-coded priority indicators
  - Overdue task highlighting
  - Completion checkboxes
- **Integration:**
  - Link tasks to courses
  - Display in calendar
  - Set reminders

**Usage:**
1. Click "+ Add Task" to create
2. Enter title and optional description
3. Set priority and due date
4. Click checkboxes to mark complete
5. Use filters to organize view

**API Endpoints:**
- `GET /api/study/tasks` - Get all tasks
- `POST /api/study/tasks` - Create task
- `PUT /api/study/tasks/:id` - Update task
- `DELETE /api/study/tasks/:id` - Delete task
- `POST /api/study/tasks/:id/complete` - Mark complete

---

### 3. 📝 Study Notes

Create and organize study notes with rich formatting, tags, and folders.

**Features:**
- **Note Creation:**
  - Title and content
  - Color coding (10 colors)
  - Tags for categorization
  - Folder organization
- **Organization:**
  - Pin important notes
  - Favorite notes
  - Archive old notes
  - Search by title or content
- **Filtering:**
  - Search bar for quick access
  - Filter by tags
  - Show/hide archived
  - Sort by date or pinned status
- **Linking:**
  - Link to courses
  - Link to flashcards
  - Link to study sessions

**Usage:**
1. Click "+ New Note" to create
2. Add title and write content
3. Choose a color theme
4. Add tags (comma-separated)
5. Optionally add to folder
6. Save note

**Special Features:**
- Pin icon (📌) to keep note at top
- Star icon (⭐) to mark as favorite
- Search across all notes

**API Endpoints:**
- `GET /api/study/notes` - Get all notes
- `POST /api/study/notes` - Create note
- `PUT /api/study/notes/:id` - Update note
- `DELETE /api/study/notes/:id` - Delete note
- `POST /api/study/notes/search` - Search notes
- `POST /api/study/notes/:id/pin` - Toggle pin

---

### 4. 📅 Calendar

Unified view of all study-related events (tasks, exams, sessions).

**Features:**
- **Calendar Views:**
  - Monthly calendar grid
  - Day view panel
  - Event list for selected date
- **Event Types:**
  - Study tasks (with due dates)
  - Exam reminders
  - Study sessions
  - Color-coded by type
- **Summary Dashboard:**
  - Overdue tasks count
  - Today's tasks
  - Upcoming exams (next 7 days)
  - Pending tasks total
- **Navigation:**
  - Previous/next month buttons
  - Today highlighting
  - Click date to view events

**Usage:**
1. Navigate months with arrow buttons
2. Click on any date to see events
3. Events are color-coded by type:
   - 🔵 Blue = Tasks
   - 🟠 Orange = Exams
   - 🟢 Green = Sessions

**API Endpoints:**
- `GET /api/calendar/events` - Get events for month
- `GET /api/calendar/events/day/:date` - Get day events
- `GET /api/calendar/summary` - Get calendar summary

---

### 5. 🧮 Math Trick Practice

Interactive math practice with gamification (existing feature, integrated).

**Features:**
- Multiple game modes
- Different topics and difficulty levels
- Scoring and achievements
- Leaderboards and analytics

---

## Integrated Study Page

### Grid View

The main view shows all 4 features in a 2x2 grid:
```
┌─────────────────┬─────────────────┐
│  🍅 Pomodoro    │  📅 Calendar    │
│     Timer       │    & Events     │
├─────────────────┼─────────────────┤
│  ✅ Todo List  │  📝 Notes       │
│                 │                 │
└─────────────────┴─────────────────┘
```

### Focus Mode

Click the expand icon (⛶) on any card to enter full-screen focus mode for that feature. Click "Back to Overview" to return to grid view.

### Quick Actions Bar

Bottom action buttons for quick access:
- 🧮 Math Practice - Launch MathTrick modal
- ⏱️ Start Timer - Jump to Pomodoro
- ✓ Add Task - Jump to Todo List
- 📝 New Note - Jump to Notes

---

## Mobile Responsive Design

- **Desktop (> 1024px):** 2x2 grid layout
- **Tablet (768-1024px):** Single column stack
- **Mobile (< 768px):** Single column with compact views

---

## Feature Toggles

All features can be individually toggled via environment variables:

```bash
REACT_APP_ENABLE_POMODORO=true
REACT_APP_ENABLE_TODO_LIST=true
REACT_APP_ENABLE_STUDY_NOTES=true
REACT_APP_ENABLE_STUDY_CALENDAR=true
REACT_APP_ENABLE_MATH_TRICK=true
```

Set to `false` to disable a feature.

---

## Data Persistence

### Backend API
All features use backend APIs for persistent storage:
- User-specific data (authenticated)
- Sync across devices
- XP and rewards integration

### Local State
Frontend uses React state with API calls for:
- Real-time updates
- Optimistic UI updates
- Offline-first where applicable

---

## Rewards System

### Pomodoro Timer
- **XP:** 2 XP per minute studied
- **Bonus:** 10 XP per pomodoro completed
- **Coins:** 1 coin per minute
- **Streak:** Updates daily streak on completion

### Task Completion
- Tasks contribute to study goals
- Goal completion awards extra XP/coins

---

## Keyboard Shortcuts

*(To be implemented)*

- `P` - Focus Pomodoro
- `T` - Focus Todo List
- `N` - Focus Notes
- `C` - Focus Calendar
- `Esc` - Return to grid view

---

## Best Practices

### Pomodoro
1. Choose realistic work durations
2. Take breaks seriously
3. Complete sessions for streak tracking
4. Enable browser notifications

### Todo List
1. Set priorities accurately
2. Break large tasks into smaller ones
3. Use due dates for time-sensitive items
4. Review and update regularly

### Notes
1. Use consistent tagging system
2. Archive old notes to reduce clutter
3. Pin frequently accessed notes
4. Use colors to categorize by subject

### Calendar
1. Check summary panel daily
2. Review upcoming events weekly
3. Link tasks to calendar for visibility
4. Set realistic due dates

---

## Troubleshooting

### Pomodoro not starting
- Check if another session is active
- Ensure backend API is running
- Check console for errors

### Tasks not saving
- Verify authentication token
- Check network connectivity
- Ensure task title is filled

### Notes not appearing
- Check archived filter
- Clear search query
- Verify not filtered by tags

### Calendar events missing
- Ensure tasks have due dates
- Check date range selected
- Verify events are not archived

---

## API Authentication

All API calls require authentication via JWT token in Authorization header:
```javascript
Authorization: Bearer <token>
```

Token is stored in `localStorage` and automatically added by axios interceptors.

---

## Future Enhancements

- **Pomodoro:** Multiple timers, task integration, Spotify integration
- **Todo List:** Drag-and-drop, subtasks, recurring tasks
- **Notes:** Rich text editor, image attachments, shared notes
- **Calendar:** Google Calendar sync, iCal export, week view
- **General:** Offline mode, keyboard shortcuts, themes

---

## Technical Details

### Components Created
- `PomodoroTimer.js` + CSS
- `TodoList.js` + CSS
- `StudyNotes.js` + CSS
- `StudyCalendar.js` + CSS
- `Study.js` (page) + CSS

### API Service
- `services/api.js` - Centralized API layer with axios

### State Management
- Local React state (hooks)
- No external state library required
- API calls for persistence

### Styling
- CSS Modules
- Responsive design
- Dark mode support
- Smooth animations

---

## Support

For issues, bugs, or feature requests, create an issue in the repository with the label `study-features`.
