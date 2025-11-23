# Flashcards Feature Documentation

## Overview

The Flashcards feature provides a comprehensive spaced repetition system (SRS) for studying course material. It implements the SM-2 algorithm for optimal learning intervals and includes a modern, interactive UI for studying flashcards.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [User Guide](#user-guide)
4. [API Reference](#api-reference)
5. [Component Documentation](#component-documentation)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Features

### Core Functionality

- **Spaced Repetition System (SM-2 Algorithm)**: Cards are scheduled for review based on your performance
- **Multiple Card Types**: Support for 9 different card types (basic, multiple choice, cloze, image occlusion, etc.)
- **Study Modes**: Choose from Intensive, Normal, or Relaxed study frequencies
- **Progress Tracking**: Track your learning progress with detailed statistics
- **Course-Based Organization**: Cards are organized by courses for easy management
- **Per-User Isolation**: Each user has their own cards and progress
- **Offline-Ready**: Basic offline support with localStorage fallback

### UI Features

- **Card Flip Animation**: Smooth 3D flip animation for revealing answers
- **Quality Rating**: 4-level rating system (Again, Hard, Good, Easy)
- **Session Stats**: Real-time progress tracking during study sessions
- **Compact View**: Integration with Study page for quick access
- **Focus Mode**: Expand flashcards to full-screen for distraction-free studying
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Automatic dark mode support

## Architecture

### Backend

**Database Model** (`backend/models/Card.js`):
```
Card {
  - id: integer
  - question: text (required)
  - answer: text (required)
  - hint: text (optional)
  - explanation: text (optional)
  - cardType: enum (basic, multiple_choice, cloze, etc.)
  - options: JSON (for multiple choice)
  - courseId: foreign key
  - userId: foreign key
  - easeFactor: float (SM-2 algorithm)
  - interval: integer (days until next review)
  - repetitions: integer
  - nextReviewDate: datetime
  - lastReviewDate: datetime
  - status: enum (new, learning, reviewing, mastered)
  - isActive: boolean (soft delete)
  - isSuspended: boolean
  - tags: JSON array
}
```

**API Endpoints** (`backend/routes/cards.js`):
- `GET /api/cards` - Get all user's cards
- `GET /api/cards/due` - Get cards due for review
- `POST /api/cards` - Create a new card
- `PUT /api/cards/:id` - Update a card
- `DELETE /api/cards/:id` - Soft delete a card

**Spaced Repetition Logic**:
The SM-2 algorithm is implemented in the Card model's `calculateNextReview()` method, supporting three frequency modes:
- **Intensive**: First review after 1 day, second after 3 days (0.8x multiplier)
- **Normal**: First review after 1 day, second after 4 days (1.0x multiplier)
- **Relaxed**: First review after 2 days, second after 7 days (1.2x multiplier)

### Frontend

**Components**:

1. **FlashcardViewer** (`frontend/src/components/FlashcardViewer.js`)
   - Displays a single card with flip animation
   - Handles answer reveal and quality rating

2. **FlashcardStudy** (`frontend/src/components/FlashcardStudy.js`)
   - Main study session component
   - Manages card queue and session progress
   - Handles API calls for card reviews

3. **DeckSelector** (`frontend/src/components/DeckSelector.js`)
   - Allows users to choose which course/deck to study
   - Displays card counts and due card statistics

4. **FlashcardQuickView** (`frontend/src/components/FlashcardQuickView.js`)
   - Compact view for Study page integration
   - Shows due card count and preview

**API Service** (`frontend/src/services/api.js`):
```javascript
cardsAPI {
  getAll(params)     // Get all cards
  getDue(params)     // Get cards due for review
  getById(cardId)    // Get single card
  create(cardData)   // Create card
  update(cardId, cardData)  // Update card
  delete(cardId)     // Delete card
  review(cardId, reviewData) // Submit review
}
```

## User Guide

### Accessing Flashcards

1. **From Study Page**:
   - Navigate to the Study page
   - Find the Flashcards card in the grid
   - Click "Start Studying" to begin a session
   - Or click the expand button (⛶) for focus mode

2. **From Course Detail**:
   - Navigate to a specific course
   - Click "Start Practicing"
   - Begin studying cards from that course

3. **Quick Actions**:
   - Use the Flashcards quick action button on the Study page

### Studying Flashcards

1. **View the Question**: Read the card front (question)
2. **Reveal the Answer**: Click anywhere on the card to flip it
3. **Rate Your Knowledge**:
   - **Again (😞)**: Didn't know it → Card resets to beginning
   - **Hard (😐)**: Barely knew it → Short review interval
   - **Good (🙂)**: Knew it with effort → Normal interval
   - **Easy (😄)**: Knew it perfectly → Long interval

### Understanding Progress

- **Green checkmarks**: Correct answers (rated Good or Easy)
- **Red crosses**: Incorrect answers (rated Again or Hard)
- **Progress bar**: Shows completion through the session
- **Session complete screen**: Displays accuracy and statistics

### Tips for Effective Study

1. **Be Honest with Ratings**: Accurate ratings improve the algorithm's effectiveness
2. **Study Regularly**: Daily review is most effective for retention
3. **Use Hints**: If available, use hints before revealing the answer
4. **Read Explanations**: Learn from the explanations provided
5. **Don't Overwhelm**: Start with smaller decks and build up

## API Reference

### Get Due Cards

```http
GET /api/cards/due?courseId=123&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": 1,
        "question": "What is the capital of France?",
        "answer": "Paris",
        "hint": "City of lights",
        "courseId": 123,
        "nextReviewDate": "2025-11-23T10:00:00Z",
        "easeFactor": 2.5,
        "interval": 1,
        "repetitions": 0,
        "status": "new"
      }
    ],
    "count": 1
  }
}
```

### Update Card Review

```http
PUT /api/cards/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quality": 3,
  "reviewedAt": "2025-11-23T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Card updated successfully",
  "data": {
    "card": {
      "id": 1,
      "easeFactor": 2.5,
      "interval": 4,
      "repetitions": 1,
      "nextReviewDate": "2025-11-27T10:30:00Z"
    }
  }
}
```

## Component Documentation

### FlashcardViewer

**Props:**
- `card` (object, required): Card data to display
- `onAnswer` (function, optional): Callback when user rates the card
- `showAnswer` (boolean, optional): Initially show answer side

**Usage:**
```jsx
<FlashcardViewer
  card={currentCard}
  onAnswer={(quality) => handleAnswer(quality)}
/>
```

### FlashcardStudy

**Props:**
- `courseId` (number, optional): Filter cards by course
- `onClose` (function, optional): Callback when session closes
- `compact` (boolean, optional): Use compact layout

**Usage:**
```jsx
<FlashcardStudy
  courseId={123}
  onClose={() => handleClose()}
/>
```

### DeckSelector

**Props:**
- `onSelect` (function, required): Callback when deck is selected
- `onClose` (function, optional): Callback when selector closes

**Usage:**
```jsx
<DeckSelector
  onSelect={(courseId) => startStudying(courseId)}
  onClose={() => closeModal()}
/>
```

## Configuration

### Feature Toggle

The flashcards feature can be enabled/disabled via environment variable:

```bash
# Enable flashcards (default: true)
REACT_APP_ENABLE_FLASHCARDS=true

# Disable flashcards
REACT_APP_ENABLE_FLASHCARDS=false
```

**In code:**
```javascript
import { isFeatureEnabled } from '../config';

if (isFeatureEnabled('flashcards')) {
  // Show flashcards feature
}
```

### Frequency Modes

Configure study frequency modes in the Card model:

```javascript
const frequencySettings = {
  intensive: { first: 1, second: 3, multiplier: 0.8 },
  normal: { first: 1, second: 4, multiplier: 1.0 },
  relaxed: { first: 2, second: 7, multiplier: 1.2 }
};
```

## Testing

### Running Tests

**Backend Tests:**
```bash
cd backend
npm test -- cards.test.js
```

**Frontend Tests:**
```bash
cd frontend
npm test -- Flashcard
```

### Test Coverage

- **Backend**: Full API endpoint coverage in `backend/__tests__/cards.test.js`
- **Frontend**: Component tests for FlashcardViewer, FlashcardStudy, DeckSelector

### Manual Testing Checklist

- [ ] Load Study page and see Flashcards card
- [ ] Click "Start Studying" and begin session
- [ ] Flip a card to reveal answer
- [ ] Rate cards with all 4 quality levels
- [ ] Complete a study session
- [ ] Check session statistics
- [ ] Test with no cards due
- [ ] Test with multiple courses
- [ ] Test mobile responsive layout
- [ ] Test dark mode
- [ ] Test feature toggle (disable and enable)

## Troubleshooting

### Cards Not Loading

**Symptom**: Flashcard component shows "Loading..." indefinitely

**Solutions**:
1. Check backend API is running: `curl http://localhost:5000/api/cards`
2. Verify authentication token in localStorage
3. Check browser console for API errors
4. Verify CORS settings in backend

### Cards Not Due

**Symptom**: "All caught up!" message when cards should be due

**Solutions**:
1. Check `nextReviewDate` in database
2. Verify server timezone matches expected timezone
3. Check card `isSuspended` flag
4. Ensure cards have `isActive = true`

### Flip Animation Not Working

**Symptom**: Card doesn't flip or jumps

**Solutions**:
1. Check CSS is loaded: `FlashcardViewer.css`
2. Clear browser cache
3. Check for CSS conflicts with other styles
4. Ensure browser supports CSS 3D transforms

### Progress Not Saving

**Symptom**: Card reviews don't persist

**Solutions**:
1. Check API response for errors
2. Verify database connection
3. Check user authentication
4. Look for validation errors in backend logs

## Rollback Plan

### Disabling Feature

To quickly disable flashcards in production:

1. **Environment Variable**:
   ```bash
   REACT_APP_ENABLE_FLASHCARDS=false
   ```

2. **Restart Frontend**: The feature will be hidden from UI

### Rolling Back Code

To completely remove flashcards:

1. **Revert PR**:
   ```bash
   git revert <merge-commit-sha>
   git push origin main
   ```

2. **Database**: No migration needed (soft deletes used)

3. **Frontend**: Deploy reverted code

### Data Preservation

- Card data remains in database during rollback
- No data loss when re-enabling feature
- Spaced repetition progress preserved

## Performance Considerations

### API Optimization

- Limit card queries to 20-100 cards per request
- Use pagination for large decks
- Cache course data to reduce API calls
- Use indexes on `nextReviewDate`, `userId`, `courseId`

### Frontend Optimization

- Lazy load FlashcardStudy component
- Preload next 2-3 cards during study
- Debounce API calls for card updates
- Use React.memo for FlashcardViewer

### Database Optimization

Recommended indexes:
```sql
CREATE INDEX idx_cards_user_due ON cards(user_id, next_review_date);
CREATE INDEX idx_cards_course_active ON cards(course_id, is_active);
CREATE INDEX idx_cards_status ON cards(status);
```

## Future Enhancements

- [ ] Import/Export deck functionality
- [ ] Shared deck marketplace
- [ ] Advanced statistics and analytics
- [ ] Audio flashcards
- [ ] Collaborative decks
- [ ] AI-generated cards
- [ ] Gamification (streaks, achievements)
- [ ] Study reminders
- [ ] Offline sync
- [ ] Custom SRS algorithms

## Support

For issues or questions:
- GitHub Issues: [FlashMind Issues](https://github.com/Xen065/FlashMindNew/issues)
- Documentation: See main README.md
- API Contract: See API_CONTRACT.md

## Changelog

### Version 1.0.0 (2025-11-23)
- Initial flashcards implementation
- SM-2 spaced repetition algorithm
- Study page integration
- Course-based practice mode
- Feature toggle support
- Mobile responsive design
- Dark mode support
