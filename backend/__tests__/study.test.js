/**
 * ============================================
 * Study API Tests
 * ============================================
 * Tests for study sessions and card review with spaced repetition
 */

const request = require('supertest');
const app = require('../server');
const { User, Course, Card, StudySession } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Study API', () => {
  let student;
  let studentToken;
  let testCourse;
  let testCard;

  beforeEach(async () => {
    // Create student
    student = await User.create({
      username: 'studystudent',
      email: 'study@example.com',
      password: 'Test123!',
      fullName: 'Study Student',
      role: 'student',
      frequencyMode: 'normal'
    });
    studentToken = generateToken(student.id);

    // Create course
    testCourse = await Course.create({
      title: 'Study Test Course',
      description: 'Course for study testing',
      instructorId: student.id,
      isPublished: true
    });

    // Create test card
    testCard = await Card.create({
      userId: student.id,
      courseId: testCourse.id,
      question: 'What is spaced repetition?',
      answer: 'A learning technique',
      cardType: 'basic',
      status: 'new',
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      timesReviewed: 0,
      timesCorrect: 0,
      timesIncorrect: 0
    });
  });

  describe('POST /api/study/review', () => {
    test('should review card with quality 3 (Good)', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reviewed successfully');
      expect(res.body.data.card).toBeDefined();
      expect(res.body.data.nextReview).toBeDefined();
      expect(res.body.data.interval).toBeDefined();
    });

    test('should update card spaced repetition data', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3
        });

      expect(res.status).toBe(200);
      const updatedCard = res.body.data.card;

      // Check SM-2 algorithm fields
      expect(updatedCard.repetitions).toBe(1); // First correct answer
      expect(updatedCard.interval).toBe(1); // First interval: 1 day
      expect(updatedCard.easeFactor).toBe(2.5);
      expect(updatedCard.nextReviewDate).toBeDefined();
      expect(updatedCard.lastReviewDate).toBeDefined();
    });

    test('should update card statistics', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3
        });

      expect(res.status).toBe(200);
      const updatedCard = res.body.data.card;

      expect(updatedCard.timesReviewed).toBe(1);
      expect(updatedCard.timesCorrect).toBe(1);
      expect(updatedCard.timesIncorrect).toBe(0);
    });

    test('should increment timesIncorrect on quality < 3', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 1 // Again
        });

      expect(res.status).toBe(200);
      const updatedCard = res.body.data.card;

      expect(updatedCard.timesReviewed).toBe(1);
      expect(updatedCard.timesCorrect).toBe(0);
      expect(updatedCard.timesIncorrect).toBe(1);
    });

    test('should update card status from new to learning', async () => {
      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 1 // Incorrect answer
        });

      const card = await Card.findByPk(testCard.id);
      expect(card.status).toBe('learning');
      expect(card.repetitions).toBe(0); // Reset on incorrect
    });

    test('should update card status to reviewing after 3+ correct reviews', async () => {
      // Review 1: Good
      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cardId: testCard.id, quality: 3 });

      // Review 2: Good
      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cardId: testCard.id, quality: 3 });

      // Review 3: Good
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cardId: testCard.id, quality: 3 });

      expect(res.status).toBe(200);
      const card = await Card.findByPk(testCard.id);
      expect(card.status).toBe('reviewing');
      expect(card.repetitions).toBe(3);
    });

    test('should update card status to mastered after 10+ reps with EF >= 2.3', async () => {
      // Set card to high repetitions
      testCard.repetitions = 9;
      testCard.easeFactor = 2.5;
      testCard.interval = 100;
      await testCard.save();

      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cardId: testCard.id, quality: 4 }); // Easy

      expect(res.status).toBe(200);
      const card = await Card.findByPk(testCard.id);
      expect(card.status).toBe('mastered');
      expect(card.repetitions).toBe(10);
    });

    test('should initialize user streak on first study', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3
        });

      expect(res.status).toBe(200);

      const user = await User.findByPk(student.id);
      expect(user.currentStreak).toBe(1);
      expect(user.longestStreak).toBe(1);
      expect(user.lastStudyDate).toBeDefined();
    });

    test('should increment streak on consecutive day', async () => {
      // Set last study to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      student.lastStudyDate = yesterday;
      student.currentStreak = 5;
      student.longestStreak = 5;
      await student.save();

      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3
        });

      const user = await User.findByPk(student.id);
      expect(user.currentStreak).toBe(6); // Incremented
      expect(user.longestStreak).toBe(6); // Updated
    });

    test('should reset streak when broken', async () => {
      // Set last study to 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      student.lastStudyDate = threeDaysAgo;
      student.currentStreak = 10;
      student.longestStreak = 15;
      await student.save();

      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3
        });

      const user = await User.findByPk(student.id);
      expect(user.currentStreak).toBe(1); // Reset to 1
      expect(user.longestStreak).toBe(15); // Longest unchanged
    });

    test('should not update streak on same day', async () => {
      // Set last study to today
      student.lastStudyDate = new Date();
      student.currentStreak = 5;
      await student.save();

      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3
        });

      const user = await User.findByPk(student.id);
      expect(user.currentStreak).toBe(5); // Unchanged
    });

    test('should award XP based on quality', async () => {
      const initialXP = student.experiencePoints;

      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3
        });

      const user = await User.findByPk(student.id);
      expect(user.experiencePoints).toBe(initialXP + 15); // quality * 5 = 3 * 5 = 15
    });

    test('should award different XP for different quality ratings', async () => {
      const initialXP = student.experiencePoints;

      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 4 // Easy
        });

      const user = await User.findByPk(student.id);
      expect(user.experiencePoints).toBe(initialXP + 20); // 4 * 5 = 20
    });

    test('should award 2 coins for quality >= 3', async () => {
      const initialCoins = student.coins;

      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3
        });

      const user = await User.findByPk(student.id);
      expect(user.coins).toBe(initialCoins + 2);
    });

    test('should award 1 coin for quality < 3', async () => {
      const initialCoins = student.coins;

      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 1
        });

      const user = await User.findByPk(student.id);
      expect(user.coins).toBe(initialCoins + 1);
    });

    test('should use user frequency mode for calculations', async () => {
      // Set user to intensive mode
      student.frequencyMode = 'intensive';
      await student.save();

      // First review
      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cardId: testCard.id, quality: 3 });

      // Second review
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cardId: testCard.id, quality: 3 });

      expect(res.status).toBe(200);
      const card = await Card.findByPk(testCard.id);
      // Intensive mode: second interval is 3 days (vs 4 in normal)
      expect(card.interval).toBe(3);
    });

    test('should update average response time', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3,
          responseTime: 5000 // 5 seconds
        });

      expect(res.status).toBe(200);
      const card = await Card.findByPk(testCard.id);
      expect(card.averageResponseTime).toBe(5000);
    });

    test('should average response time over multiple reviews', async () => {
      // First review with 4000ms
      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3,
          responseTime: 4000
        });

      // Second review with 6000ms
      await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 3,
          responseTime: 6000
        });

      const card = await Card.findByPk(testCard.id);
      expect(card.averageResponseTime).toBe(5000); // (4000 + 6000) / 2
    });

    test('should reject review without cardId', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          quality: 3
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    test('should reject review without quality', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    test('should reject review with quality < 1', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 0
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject review with quality > 4', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id,
          quality: 5
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject review of non-existent card', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: 99999,
          quality: 3
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    test('should reject review of another user\'s card', async () => {
      // Create another user and their card
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'Test123!',
        fullName: 'Other User'
      });

      const otherCard = await Card.create({
        userId: otherUser.id,
        courseId: testCourse.id,
        question: 'Other user question',
        answer: 'Other user answer'
      });

      const res = await request(app)
        .post('/api/study/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: otherCard.id,
          quality: 3
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should reject review without authentication', async () => {
      const res = await request(app)
        .post('/api/study/review')
        .send({
          cardId: testCard.id,
          quality: 3
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/study/skip', () => {
    test('should skip card successfully', async () => {
      const res = await request(app)
        .post('/api/study/skip')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('skipped');
      expect(res.body.data.card).toBeDefined();
      expect(res.body.data.nextReview).toBeDefined();
    });

    test('should set next review to ~1 hour from now', async () => {
      const beforeSkip = new Date();

      const res = await request(app)
        .post('/api/study/skip')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id
        });

      expect(res.status).toBe(200);

      const nextReview = new Date(res.body.data.nextReview);
      const expectedTime = new Date(beforeSkip);
      expectedTime.setHours(expectedTime.getHours() + 1);

      // Allow 5 second tolerance
      const timeDiff = Math.abs(nextReview.getTime() - expectedTime.getTime());
      expect(timeDiff).toBeLessThan(5000);
    });

    test('should update card nextReviewDate', async () => {
      const res = await request(app)
        .post('/api/study/skip')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: testCard.id
        });

      expect(res.status).toBe(200);

      const card = await Card.findByPk(testCard.id);
      expect(card.nextReviewDate).toBeDefined();

      const nextReview = new Date(card.nextReviewDate);
      const now = new Date();
      expect(nextReview.getTime()).toBeGreaterThan(now.getTime());
    });

    test('should reject skip without cardId', async () => {
      const res = await request(app)
        .post('/api/study/skip')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    test('should reject skip of non-existent card', async () => {
      const res = await request(app)
        .post('/api/study/skip')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: 99999
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    test('should reject skip of another user\'s card', async () => {
      const otherUser = await User.create({
        username: 'skipother',
        email: 'skipother@example.com',
        password: 'Test123!',
        fullName: 'Skip Other'
      });

      const otherCard = await Card.create({
        userId: otherUser.id,
        courseId: testCourse.id,
        question: 'Skip test',
        answer: 'Skip answer'
      });

      const res = await request(app)
        .post('/api/study/skip')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cardId: otherCard.id
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should reject skip without authentication', async () => {
      const res = await request(app)
        .post('/api/study/skip')
        .send({
          cardId: testCard.id
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/study/sessions', () => {
    test('should create study session with all fields', async () => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);

      const res = await request(app)
        .post('/api/study/sessions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: testCourse.id,
          title: 'Morning Study Session',
          scheduledDate: scheduledDate
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('created');
      expect(res.body.data.session).toBeDefined();
      expect(res.body.data.session.title).toBe('Morning Study Session');
      expect(res.body.data.session.courseId).toBe(testCourse.id);
    });

    test('should create study session with minimal data', async () => {
      const res = await request(app)
        .post('/api/study/sessions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session).toBeDefined();
    });

    test('should use default title if not provided', async () => {
      const res = await request(app)
        .post('/api/study/sessions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.data.session.title).toBe('Study Session');
    });

    test('should use current date if scheduledDate not provided', async () => {
      const beforeCreate = new Date();

      const res = await request(app)
        .post('/api/study/sessions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});

      expect(res.status).toBe(201);

      const sessionDate = new Date(res.body.data.session.scheduledDate);
      expect(sessionDate.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    });

    test('should allow null courseId', async () => {
      const res = await request(app)
        .post('/api/study/sessions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'General Study',
          courseId: null
        });

      expect(res.status).toBe(201);
      expect(res.body.data.session.courseId).toBeNull();
    });

    test('should reject session creation without authentication', async () => {
      const res = await request(app)
        .post('/api/study/sessions')
        .send({
          title: 'Test Session'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/study/sessions', () => {
    beforeEach(async () => {
      // Create multiple study sessions
      const now = new Date();

      await StudySession.create({
        userId: student.id,
        courseId: testCourse.id,
        title: 'Session 1',
        scheduledDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      });

      await StudySession.create({
        userId: student.id,
        courseId: testCourse.id,
        title: 'Session 2',
        scheduledDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      });

      await StudySession.create({
        userId: student.id,
        courseId: testCourse.id,
        title: 'Session 3',
        scheduledDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      });
    });

    test('should get user study sessions', async () => {
      const res = await request(app)
        .get('/api/study/sessions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessions).toBeDefined();
      expect(Array.isArray(res.body.data.sessions)).toBe(true);
      expect(res.body.data.count).toBe(3);
    });

    test('should order sessions by scheduledDate DESC', async () => {
      const res = await request(app)
        .get('/api/study/sessions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      const sessions = res.body.data.sessions;

      expect(sessions[0].title).toBe('Session 3'); // Most recent
      expect(sessions[1].title).toBe('Session 2');
      expect(sessions[2].title).toBe('Session 1'); // Oldest
    });

    test('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/study/sessions?limit=2')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.sessions.length).toBe(2);
      expect(res.body.data.count).toBe(2);
    });

    test('should use default limit of 50', async () => {
      const res = await request(app)
        .get('/api/study/sessions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      // With only 3 sessions, should return all 3
      expect(res.body.data.sessions.length).toBe(3);
    });

    test('should return empty array for user with no sessions', async () => {
      const newUser = await User.create({
        username: 'nosessions',
        email: 'nosessions@example.com',
        password: 'Test123!',
        fullName: 'No Sessions'
      });
      const newToken = generateToken(newUser.id);

      const res = await request(app)
        .get('/api/study/sessions')
        .set('Authorization', `Bearer ${newToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.sessions).toEqual([]);
      expect(res.body.data.count).toBe(0);
    });

    test('should only return current user sessions', async () => {
      // Create another user with their own sessions
      const otherUser = await User.create({
        username: 'othersessions',
        email: 'othersessions@example.com',
        password: 'Test123!',
        fullName: 'Other Sessions'
      });

      await StudySession.create({
        userId: otherUser.id,
        title: 'Other User Session',
        scheduledDate: new Date()
      });

      const res = await request(app)
        .get('/api/study/sessions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(3); // Only student's sessions, not otherUser's

      const titles = res.body.data.sessions.map(s => s.title);
      expect(titles).not.toContain('Other User Session');
    });

    test('should reject request without authentication', async () => {
      const res = await request(app)
        .get('/api/study/sessions');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
