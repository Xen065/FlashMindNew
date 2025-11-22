# FlashMind API Contract Documentation

**Last Updated:** 2025-11-22
**Base URL:** `/api`
**Authentication Method:** JWT Token (Bearer Token in Authorization header)

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Course Management Endpoints](#course-management-endpoints)
4. [Flashcard Management Endpoints](#flashcard-management-endpoints)
5. [Study Session Endpoints](#study-session-endpoints)
6. [Response Format Specification](#response-format-specification)
7. [Error Handling](#error-handling)

---

## Authentication Endpoints

### 1. User Registration
**Endpoint:** `POST /auth/register`
**Authentication:** Public
**Description:** Register a new user account

#### Request Parameters

**Body (JSON):**
```json
{
  "username": "string (required, 3-50 chars, alphanumeric only)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 characters)",
  "fullName": "string (optional, max 100 characters)"
}
```

#### Validation Rules
- `username`: Length 3-50 characters, alphanumeric only, must be unique
- `email`: Valid email format, must be unique, will be normalized
- `password`: Minimum 6 characters
- `fullName`: Optional, maximum 100 characters

#### Success Response
**Status Code:** 201 Created
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "createdAt": "ISO8601 timestamp"
    },
    "token": "JWT token string"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Username must be between 3 and 50 characters | Invalid username length |
| 400 | Username must be alphanumeric | Invalid username format |
| 400 | Please provide a valid email | Invalid email format |
| 400 | Password must be at least 6 characters | Weak password |
| 400 | Full name must not exceed 100 characters | Exceeds limit |
| 400 | Email already registered | Email exists |
| 400 | Username already taken | Username exists |
| 500 | Error registering user | Server error |

---

### 2. User Login
**Endpoint:** `POST /auth/login`
**Authentication:** Public
**Description:** Authenticate user and receive JWT token

#### Request Parameters

**Body (JSON):**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

#### Validation Rules
- `email`: Valid email format, normalized
- `password`: Must match stored password
- Account must be active (isActive = true)

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "avatar": "string or null",
      "isActive": true
    },
    "token": "JWT token string"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Please provide a valid email | Invalid email |
| 400 | Password is required | Missing password |
| 401 | Invalid email or password | User not found or password mismatch |
| 401 | Account is deactivated | Account disabled |
| 500 | Error logging in | Server error |

---

### 3. Get Current User
**Endpoint:** `GET /auth/me`
**Authentication:** Required (Private)
**Description:** Retrieve current logged-in user's profile

#### Request Parameters
None

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "avatar": "string or null",
      "bio": "string or null",
      "isActive": true,
      "createdAt": "ISO8601 timestamp"
    }
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error fetching user data | Server error |

---

## User Management Endpoints

### 1. Get User Profile
**Endpoint:** `GET /users/profile`
**Authentication:** Required (Private)
**Description:** Retrieve authenticated user's profile information

#### Request Parameters
None

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "avatar": "string or null",
      "bio": "string or null",
      "frequencyMode": "intensive|normal|relaxed",
      "currentStreak": "integer",
      "longestStreak": "integer",
      "experiencePoints": "integer",
      "coins": "integer",
      "lastStudyDate": "ISO8601 timestamp or null",
      "createdAt": "ISO8601 timestamp"
    }
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error fetching profile | Server error |

---

### 2. Update User Profile
**Endpoint:** `PUT /users/profile`
**Authentication:** Required (Private)
**Description:** Update user's profile information

#### Request Parameters

**Body (JSON):**
```json
{
  "fullName": "string (optional)",
  "bio": "string (optional)",
  "avatar": "string URL (optional)"
}
```

#### Validation Rules
- All fields are optional
- Only provided fields will be updated

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "bio": "string or null",
      "avatar": "string or null",
      "updatedAt": "ISO8601 timestamp"
    }
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error updating profile | Server error |

---

### 3. Update Frequency Mode
**Endpoint:** `PUT /users/settings/frequency-mode`
**Authentication:** Required (Private)
**Description:** Update user's flashcard study frequency preference

#### Request Parameters

**Body (JSON):**
```json
{
  "frequencyMode": "string (required, one of: intensive, normal, relaxed)"
}
```

#### Validation Rules
- `frequencyMode`: Must be one of: "intensive", "normal", or "relaxed"

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "message": "Frequency mode updated successfully",
  "data": {
    "frequencyMode": "intensive|normal|relaxed"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Invalid frequency mode. Must be: intensive, normal, or relaxed | Invalid mode |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error updating frequency mode | Server error |

---

### 4. Get Frequency Mode
**Endpoint:** `GET /users/settings/frequency-mode`
**Authentication:** Required (Private)
**Description:** Retrieve user's current frequency mode preference

#### Request Parameters
None

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "data": {
    "frequencyMode": "intensive|normal|relaxed"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error fetching frequency mode | Server error |

---

## Course Management Endpoints

### 1. Get All Published Courses
**Endpoint:** `GET /courses`
**Authentication:** Optional (Public with optional auth)
**Description:** List all published courses with filtering and search

#### Request Parameters

**Query Parameters:**
```
category: string (optional) - Filter by course category
search: string (optional) - Search in title and description (case-insensitive)
limit: integer (optional, default 50) - Number of courses to return
```

#### Validation Rules
- `limit`: Parsed as integer, default 50
- Results ordered by featured status (DESC) then enrollment count (DESC)

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "title": "string",
        "description": "string",
        "category": "string",
        "icon": "string",
        "color": "string",
        "enrollmentCount": "integer",
        "isFeatured": "boolean",
        "isPublished": true,
        "createdAt": "ISO8601 timestamp"
      }
    ],
    "count": "integer"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 500 | Error fetching courses | Server error |

---

### 2. Get Single Course
**Endpoint:** `GET /courses/:id`
**Authentication:** Optional (Public with optional auth)
**Description:** Get detailed information about a specific course

#### Request Parameters

**Path Parameters:**
```
id: string (required) - Course UUID
```

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "category": "string",
      "icon": "string",
      "color": "string",
      "enrollmentCount": "integer",
      "isFeatured": "boolean",
      "isPublished": true,
      "cardCount": "integer (if available)",
      "createdAt": "ISO8601 timestamp"
    }
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 404 | Course not found | Invalid course ID |
| 500 | Error fetching course | Server error |

---

### 3. Enroll in Course
**Endpoint:** `POST /courses/:id/enroll`
**Authentication:** Required (Private)
**Description:** Enroll authenticated user in a course and copy template cards

#### Request Parameters

**Path Parameters:**
```
id: string (required) - Course UUID
```

**Body:** Empty JSON object `{}`

#### Success Response
**Status Code:** 201 Created
```json
{
  "success": true,
  "message": "Enrolled successfully! {cardsCreated} flashcards added to your study queue.",
  "data": {
    "enrollment": {
      "id": "uuid",
      "userId": "uuid",
      "courseId": "uuid",
      "isActive": true,
      "enrolledAt": "ISO8601 timestamp"
    },
    "cardsCreated": "integer"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 404 | Course not found | Invalid course ID |
| 400 | Already enrolled in this course | Duplicate enrollment |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error enrolling in course | Server error |

#### Additional Behavior
- Copies all template cards (userId: null) from course to user
- Initializes card properties: status=new, easeFactor=2.5, interval=0, repetitions=0
- Increments course enrollment count

---

### 4. Get Enrolled Courses
**Endpoint:** `GET /courses/my/enrolled`
**Authentication:** Required (Private)
**Description:** Get list of courses authenticated user is enrolled in

#### Request Parameters
None

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "id": "uuid",
        "userId": "uuid",
        "courseId": "uuid",
        "isActive": true,
        "enrolledAt": "ISO8601 timestamp",
        "Course": {
          "id": "uuid",
          "title": "string",
          "description": "string",
          "category": "string",
          "icon": "string",
          "color": "string"
        }
      }
    ],
    "count": "integer"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error fetching enrolled courses | Server error |

---

## Flashcard Management Endpoints

### 1. Get User's Cards
**Endpoint:** `GET /cards`
**Authentication:** Required (Private)
**Description:** Retrieve user's flashcards with optional filtering

#### Request Parameters

**Query Parameters:**
```
courseId: string (optional) - Filter cards by course
status: string (optional) - Filter by card status (new, learning, reviewing, mastered)
limit: integer (optional, default 100) - Number of cards to return
```

#### Validation Rules
- `limit`: Parsed as integer, default 100
- Results ordered by nextReviewDate (ascending)
- Only returns active cards (isActive: true)

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "uuid",
        "question": "string",
        "answer": "string",
        "hint": "string or null",
        "explanation": "string or null",
        "cardType": "basic|multiple-choice|image-occlusion",
        "options": "array or null",
        "imageUrl": "string or null",
        "occludedRegions": "array or null",
        "status": "new|learning|reviewing|mastered",
        "easeFactor": "number",
        "interval": "integer",
        "repetitions": "integer",
        "nextReviewDate": "ISO8601 timestamp",
        "lastReviewDate": "ISO8601 timestamp or null",
        "timesReviewed": "integer",
        "timesCorrect": "integer",
        "timesIncorrect": "integer",
        "averageResponseTime": "number or null",
        "isActive": true,
        "course": {
          "id": "uuid",
          "title": "string",
          "icon": "string",
          "color": "string"
        },
        "createdAt": "ISO8601 timestamp"
      }
    ],
    "count": "integer"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error fetching cards | Server error |

---

### 2. Get Due Cards
**Endpoint:** `GET /cards/due`
**Authentication:** Required (Private)
**Description:** Get cards due for review (nextReviewDate <= now)

#### Request Parameters

**Query Parameters:**
```
courseId: string (optional) - Filter cards by course
limit: integer (optional, default 20) - Number of cards to return
```

#### Validation Rules
- `limit`: Parsed as integer, default 20
- Returns only non-suspended cards with nextReviewDate <= current date/time
- Results ordered by nextReviewDate (ascending - oldest first)

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "uuid",
        "question": "string",
        "answer": "string",
        "cardType": "basic|multiple-choice|image-occlusion",
        "status": "new|learning|reviewing|mastered",
        "nextReviewDate": "ISO8601 timestamp",
        "course": {
          "id": "uuid",
          "title": "string",
          "icon": "string",
          "color": "string"
        }
      }
    ],
    "count": "integer"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error fetching due cards | Server error |

---

### 3. Create Card
**Endpoint:** `POST /cards`
**Authentication:** Required (Private)
**Description:** Create a new flashcard

#### Request Parameters

**Body (JSON):**
```json
{
  "question": "string (required)",
  "answer": "string (required)",
  "courseId": "string UUID (required)",
  "hint": "string (optional)",
  "cardType": "string (optional, default 'basic')",
  "options": "array (optional, for multiple-choice cards)"
}
```

#### Validation Rules
- `question`: Required, non-empty string
- `answer`: Required, non-empty string
- `courseId`: Required, must be valid UUID
- `cardType`: Optional, defaults to 'basic' (can be: basic, multiple-choice, image-occlusion)
- `options`: Optional array for multiple-choice cards

#### Success Response
**Status Code:** 201 Created
```json
{
  "success": true,
  "message": "Card created successfully",
  "data": {
    "card": {
      "id": "uuid",
      "question": "string",
      "answer": "string",
      "hint": "string or null",
      "cardType": "basic",
      "options": "array or null",
      "userId": "uuid",
      "courseId": "uuid",
      "status": "new",
      "easeFactor": 2.5,
      "interval": 0,
      "repetitions": 0,
      "nextReviewDate": "ISO8601 timestamp",
      "isActive": true,
      "createdAt": "ISO8601 timestamp"
    }
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Question, answer, and courseId are required | Missing required fields |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error creating card | Server error |

---

### 4. Update Card
**Endpoint:** `PUT /cards/:id`
**Authentication:** Required (Private)
**Description:** Update an existing flashcard

#### Request Parameters

**Path Parameters:**
```
id: string (required) - Card UUID
```

**Body (JSON):**
```json
{
  "question": "string (optional)",
  "answer": "string (optional)",
  "hint": "string (optional)",
  "options": "array (optional)"
}
```

#### Validation Rules
- All fields are optional
- User can only update their own cards
- Only provided fields will be updated

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "message": "Card updated successfully",
  "data": {
    "card": {
      "id": "uuid",
      "question": "string",
      "answer": "string",
      "hint": "string or null",
      "options": "array or null",
      "userId": "uuid",
      "courseId": "uuid",
      "updatedAt": "ISO8601 timestamp"
    }
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 404 | Card not found | Card doesn't exist or user doesn't own it |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error updating card | Server error |

---

### 5. Delete Card
**Endpoint:** `DELETE /cards/:id`
**Authentication:** Required (Private)
**Description:** Delete a flashcard (soft delete)

#### Request Parameters

**Path Parameters:**
```
id: string (required) - Card UUID
```

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 404 | Card not found | Card doesn't exist or user doesn't own it |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error deleting card | Server error |

#### Additional Behavior
- Performs soft delete by setting `isActive: false`
- Card data is preserved in database

---

## Study Session Endpoints

### 1. Review Card
**Endpoint:** `POST /study/review`
**Authentication:** Required (Private)
**Description:** Review a flashcard and update spaced repetition data

#### Request Parameters

**Body (JSON):**
```json
{
  "cardId": "string UUID (required)",
  "quality": "integer (required, 1-4)",
  "responseTime": "number milliseconds (optional)"
}
```

#### Validation Rules
- `cardId`: Required, must be valid UUID
- `quality`: Required, must be 1, 2, 3, or 4
  - 1 = Again (incorrect, need immediate review)
  - 2 = Hard (difficulty recalling, needs more practice)
  - 3 = Good (correct, but with hesitation)
  - 4 = Easy (correct response)
- `responseTime`: Optional milliseconds for response timing
- User can only review their own cards

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "message": "Card reviewed successfully",
  "data": {
    "card": {
      "id": "uuid",
      "question": "string",
      "answer": "string",
      "status": "new|learning|reviewing|mastered",
      "easeFactor": "number",
      "interval": "integer (days)",
      "repetitions": "integer",
      "nextReviewDate": "ISO8601 timestamp",
      "lastReviewDate": "ISO8601 timestamp",
      "timesReviewed": "integer",
      "timesCorrect": "integer",
      "timesIncorrect": "integer",
      "averageResponseTime": "number or null"
    },
    "nextReview": "ISO8601 timestamp",
    "interval": "integer (days)"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Valid cardId and quality (1-4) are required | Missing or invalid parameters |
| 404 | Card not found | Card doesn't exist or user doesn't own it |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error reviewing card | Server error |

#### Algorithm Details
- Uses SM-2 (SuperMemo 2) spaced repetition algorithm
- Frequency mode adjustment:
  - Intensive: Shorter review intervals
  - Normal: Standard intervals
  - Relaxed: Longer review intervals
- Status progression:
  - learning: 0 < repetitions < 3
  - reviewing: 3 <= repetitions with quality >= 3
  - mastered: 10+ repetitions with easeFactor >= 2.3
- XP/Coins gained:
  - XP: quality * 5
  - Coins: 2 if quality >= 3, else 1
- Streak: Updated when studying on new day

---

### 2. Skip Card
**Endpoint:** `POST /study/skip`
**Authentication:** Required (Private)
**Description:** Skip a card and defer review by 1 hour

#### Request Parameters

**Body (JSON):**
```json
{
  "cardId": "string UUID (required)"
}
```

#### Validation Rules
- `cardId`: Required, must be valid UUID
- User can only skip their own cards

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "message": "Card skipped for 1 hour",
  "data": {
    "card": {
      "id": "uuid",
      "question": "string",
      "nextReviewDate": "ISO8601 timestamp (now + 1 hour)"
    },
    "nextReview": "ISO8601 timestamp"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 400 | cardId is required | Missing cardId |
| 404 | Card not found | Card doesn't exist or user doesn't own it |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error skipping card | Server error |

---

### 3. Create Study Session
**Endpoint:** `POST /study/sessions`
**Authentication:** Required (Private)
**Description:** Create a new study session

#### Request Parameters

**Body (JSON):**
```json
{
  "courseId": "string UUID (optional)",
  "title": "string (optional, default 'Study Session')",
  "scheduledDate": "ISO8601 timestamp (optional, default now)"
}
```

#### Validation Rules
- All fields optional
- `courseId`: Optional, can be null for multi-course sessions
- `title`: Defaults to "Study Session"
- `scheduledDate`: Defaults to current timestamp

#### Success Response
**Status Code:** 201 Created
```json
{
  "success": true,
  "message": "Study session created",
  "data": {
    "session": {
      "id": "uuid",
      "userId": "uuid",
      "courseId": "uuid or null",
      "title": "string",
      "scheduledDate": "ISO8601 timestamp",
      "cardsReviewed": "integer (default 0)",
      "isActive": true,
      "createdAt": "ISO8601 timestamp"
    }
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error creating study session | Server error |

---

### 4. Get Study Sessions
**Endpoint:** `GET /study/sessions`
**Authentication:** Required (Private)
**Description:** Get user's study sessions

#### Request Parameters

**Query Parameters:**
```
limit: integer (optional, default 50) - Number of sessions to return
```

#### Validation Rules
- `limit`: Parsed as integer, default 50
- Results ordered by scheduledDate (descending - most recent first)

#### Success Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "courseId": "uuid or null",
        "title": "string",
        "scheduledDate": "ISO8601 timestamp",
        "cardsReviewed": "integer",
        "isActive": true,
        "createdAt": "ISO8601 timestamp"
      }
    ],
    "count": "integer"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Unauthorized | Missing or invalid token |
| 500 | Error fetching sessions | Server error |

---

## Response Format Specification

### Standard Success Response
All successful responses follow this format:
```json
{
  "success": true,
  "message": "string (optional for GET requests)",
  "data": {
    // Endpoint-specific data
  }
}
```

**Status Codes:**
- 200 OK - Successful GET/PUT requests
- 201 Created - Successful POST requests (resource creation)

### Standard Error Response
All error responses follow this format:
```json
{
  "success": false,
  "message": "string describing error",
  "errors": "array (only for validation errors)"
}
```

**Error Response Structure (Validation Errors):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "msg": "string error message",
      "param": "string parameter name",
      "location": "string (body|query|params)"
    }
  ]
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Typical Cause |
|------|---------|--------------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST request (resource created) |
| 400 | Bad Request | Validation error or missing required field |
| 401 | Unauthorized | Missing, expired, or invalid JWT token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side error |

### Authentication & Authorization

**Header Required for Private Endpoints:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Token Validation:**
- Extracted from Authorization header with "Bearer " prefix
- If invalid/missing on protected route: Returns 401 Unauthorized
- Optional auth endpoints work with or without token

**Environment-Specific Error Details:**
- Development: Error messages include error.message details
- Production: Generic error messages without technical details

### Validation Best Practices

1. **Input Validation:**
   - All request parameters validated using express-validator
   - Validation errors returned with detailed field information
   - String inputs trimmed and normalized where applicable

2. **Request Body Validation:**
   - Only fields explicitly documented are validated/processed
   - Extra fields ignored
   - Missing optional fields don't cause errors

3. **ID Validation:**
   - All IDs are UUIDs
   - Invalid format returns 400 or 404 depending on endpoint

4. **Ownership Verification:**
   - User can only access/modify their own resources
   - Violation returns 404 (not found) to avoid information leakage

---

## Common Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | varies | Maximum number of results to return |
| search | string | null | Search term (case-insensitive) |
| category | string | null | Filter by category |
| status | string | null | Filter by status |
| courseId | string (UUID) | null | Filter by course |

---

## Card Types and Properties

**Supported Card Types:**
- `basic`: Simple question-answer flashcard
- `multiple-choice`: Card with multiple answer options
- `image-occlusion`: Image with regions highlighted for occlusion

**Card Status Lifecycle:**
- `new`: Freshly created, never reviewed
- `learning`: Being actively learned (0-3 repetitions)
- `reviewing`: Learned but under review (3+ repetitions)
- `mastered`: Well-memorized (10+ repetitions with high ease factor)

**Card Properties:**
- `easeFactor`: Difficulty factor (2.0-5.0+, default 2.5)
- `interval`: Days until next review
- `repetitions`: Number of successful reviews
- `nextReviewDate`: When card should be reviewed next
- `averageResponseTime`: Average milliseconds to answer

---

## Frequency Mode Modifiers

**Study intensity affects spaced repetition intervals:**

| Mode | Interval Effect | Use Case |
|------|-----------------|----------|
| intensive | 0.5x multiplier | Heavy studying, exams coming |
| normal | 1.0x multiplier | Regular learning pace |
| relaxed | 1.5x multiplier | Casual learning, long-term retention |

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-22 | Initial API contract documentation |

---

**Note:** This document reflects the API implementation as of the specified date. All endpoints are fully functional and have been tested for validation and error handling.
