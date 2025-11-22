/**
 * ============================================
 * Cards API Tests
 * ============================================
 * Tests for flashcard CRUD operations and management
 */

const request = require('supertest');
const app = require('../server');
const { User, Course, Card } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Cards API', () => {
  let user;
  let userToken;
  let testCourse;
  let testCard1;
  let testCard2;
  let testCard3;

  beforeEach(async () => {
    // Create user
    user = await User.create({
      username: 'carduser',
      email: 'carduser@example.com',
      password: 'Test123!',
      fullName: 'Card User'
    });
    userToken = generateToken(user.id);

    // Create test course
    testCourse = await Course.create({
      title: 'Test Course',
      description: 'Course for card testing',
      instructorId: user.id,
      isPublished: true
    });

    // Create test cards with different states
    const now = new Date();
    const past = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const future = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    testCard1 = await Card.create({
      userId: user.id,
      courseId: testCourse.id,
      question: 'Card 1 Question',
      answer: 'Card 1 Answer',
      cardType: 'basic',
      status: 'new',
      isActive: true,
      isSuspended: false,
      nextReviewDate: past // Due for review
    });

    testCard2 = await Card.create({
      userId: user.id,
      courseId: testCourse.id,
      question: 'Card 2 Question',
      answer: 'Card 2 Answer',
      cardType: 'basic',
      status: 'learning',
      isActive: true,
      isSuspended: false,
      nextReviewDate: future // Not due yet
    });

    testCard3 = await Card.create({
      userId: user.id,
      courseId: testCourse.id,
      question: 'Card 3 Question',
      answer: 'Card 3 Answer',
      cardType: 'basic',
      status: 'reviewing',
      isActive: true,
      isSuspended: true, // Suspended card
      nextReviewDate: past
    });
  });

  describe('GET /api/cards', () => {
    test('should get all user cards', async () => {
      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cards).toBeDefined();
      expect(Array.isArray(res.body.data.cards)).toBe(true);
      expect(res.body.data.count).toBe(3);
    });

    test('should include course information', async () => {
      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const firstCard = res.body.data.cards[0];
      expect(firstCard.course).toBeDefined();
      expect(firstCard.course.title).toBe('Test Course');
    });

    test('should order cards by nextReviewDate ASC', async () => {
      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const cards = res.body.data.cards;

      // Verify cards are ordered by nextReviewDate ascending
      for (let i = 0; i < cards.length - 1; i++) {
        const current = new Date(cards[i].nextReviewDate);
        const next = new Date(cards[i + 1].nextReviewDate);
        expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
      }
    });

    test('should filter by courseId', async () => {
      // Create another course and card
      const otherCourse = await Course.create({
        title: 'Other Course',
        description: 'Another course',
        instructorId: user.id
      });

      await Card.create({
        userId: user.id,
        courseId: otherCourse.id,
        question: 'Other course card',
        answer: 'Other answer',
        isActive: true
      });

      const res = await request(app)
        .get(`/api/cards?courseId=${testCourse.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(3); // Only cards from testCourse
      const allFromTestCourse = res.body.data.cards.every(c => c.courseId === testCourse.id);
      expect(allFromTestCourse).toBe(true);
    });

    test('should filter by status', async () => {
      const res = await request(app)
        .get('/api/cards?status=learning')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(1);
      expect(res.body.data.cards[0].status).toBe('learning');
    });

    test('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/cards?limit=2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.cards.length).toBe(2);
      expect(res.body.data.count).toBe(2);
    });

    test('should use default limit of 100', async () => {
      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      // With only 3 cards, should return all
      expect(res.body.data.count).toBe(3);
    });

    test('should only return active cards', async () => {
      // Create inactive card
      await Card.create({
        userId: user.id,
        courseId: testCourse.id,
        question: 'Inactive card',
        answer: 'Inactive answer',
        isActive: false
      });

      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(3); // Doesn't include inactive card
    });

    test('should only return current user cards', async () => {
      // Create another user with their card
      const otherUser = await User.create({
        username: 'othercard',
        email: 'othercard@example.com',
        password: 'Test123!',
        fullName: 'Other Card'
      });

      await Card.create({
        userId: otherUser.id,
        courseId: testCourse.id,
        question: 'Other user card',
        answer: 'Other answer',
        isActive: true
      });

      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(3); // Only user's cards

      const allOwnedByUser = res.body.data.cards.every(c => c.userId === user.id);
      expect(allOwnedByUser).toBe(true);
    });

    test('should return empty array for user with no cards', async () => {
      const newUser = await User.create({
        username: 'nocards',
        email: 'nocards@example.com',
        password: 'Test123!',
        fullName: 'No Cards'
      });
      const newToken = generateToken(newUser.id);

      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${newToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.cards).toEqual([]);
      expect(res.body.data.count).toBe(0);
    });

    test('should reject request without authentication', async () => {
      const res = await request(app)
        .get('/api/cards');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/cards/due', () => {
    test('should get cards due for review', async () => {
      const res = await request(app)
        .get('/api/cards/due')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cards).toBeDefined();
      expect(Array.isArray(res.body.data.cards)).toBe(true);
    });

    test('should only return cards with nextReviewDate in the past', async () => {
      const res = await request(app)
        .get('/api/cards/due')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const now = new Date();

      res.body.data.cards.forEach(card => {
        const reviewDate = new Date(card.nextReviewDate);
        expect(reviewDate.getTime()).toBeLessThanOrEqual(now.getTime());
      });
    });

    test('should exclude suspended cards', async () => {
      const res = await request(app)
        .get('/api/cards/due')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      // testCard3 is suspended and due, but should not be returned
      const suspendedCard = res.body.data.cards.find(c => c.id === testCard3.id);
      expect(suspendedCard).toBeUndefined();
    });

    test('should only return active cards', async () => {
      const res = await request(app)
        .get('/api/cards/due')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const allActive = res.body.data.cards.every(c => c.isActive === true);
      expect(allActive).toBe(true);
    });

    test('should include course information', async () => {
      const res = await request(app)
        .get('/api/cards/due')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.cards.length > 0) {
        expect(res.body.data.cards[0].course).toBeDefined();
      }
    });

    test('should filter by courseId', async () => {
      // Create another course with due card
      const otherCourse = await Course.create({
        title: 'Other Course',
        description: 'Another course',
        instructorId: user.id
      });

      const past = new Date(Date.now() - 2 * 60 * 60 * 1000);
      await Card.create({
        userId: user.id,
        courseId: otherCourse.id,
        question: 'Other due card',
        answer: 'Other answer',
        isActive: true,
        isSuspended: false,
        nextReviewDate: past
      });

      const res = await request(app)
        .get(`/api/cards/due?courseId=${testCourse.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const allFromTestCourse = res.body.data.cards.every(c => c.courseId === testCourse.id);
      expect(allFromTestCourse).toBe(true);
    });

    test('should respect limit parameter', async () => {
      // Create more due cards
      const past = new Date(Date.now() - 1 * 60 * 60 * 1000);
      for (let i = 0; i < 5; i++) {
        await Card.create({
          userId: user.id,
          courseId: testCourse.id,
          question: `Extra due card ${i}`,
          answer: `Answer ${i}`,
          isActive: true,
          isSuspended: false,
          nextReviewDate: past
        });
      }

      const res = await request(app)
        .get('/api/cards/due?limit=3')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.cards.length).toBe(3);
      expect(res.body.data.count).toBe(3);
    });

    test('should use default limit of 20', async () => {
      const res = await request(app)
        .get('/api/cards/due')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      // With only 1 due card (testCard1), should return 1
      expect(res.body.data.count).toBe(1);
    });

    test('should order by nextReviewDate ASC', async () => {
      // Create multiple due cards with different review dates
      const dates = [
        new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        new Date(Date.now() - 1 * 60 * 60 * 1000)  // 1 hour ago
      ];

      for (let i = 0; i < dates.length; i++) {
        await Card.create({
          userId: user.id,
          courseId: testCourse.id,
          question: `Ordered card ${i}`,
          answer: `Answer ${i}`,
          isActive: true,
          isSuspended: false,
          nextReviewDate: dates[i]
        });
      }

      const res = await request(app)
        .get('/api/cards/due')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const cards = res.body.data.cards;

      for (let i = 0; i < cards.length - 1; i++) {
        const current = new Date(cards[i].nextReviewDate);
        const next = new Date(cards[i + 1].nextReviewDate);
        expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
      }
    });

    test('should return empty array if no cards are due', async () => {
      // Delete the due card
      await Card.destroy({ where: { id: testCard1.id } });

      const res = await request(app)
        .get('/api/cards/due')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.cards).toEqual([]);
      expect(res.body.data.count).toBe(0);
    });

    test('should reject request without authentication', async () => {
      const res = await request(app)
        .get('/api/cards/due');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/cards', () => {
    test('should create card with required fields', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'New card question',
          answer: 'New card answer',
          courseId: testCourse.id
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('created');
      expect(res.body.data.card).toBeDefined();
      expect(res.body.data.card.question).toBe('New card question');
      expect(res.body.data.card.answer).toBe('New card answer');
    });

    test('should create card with all fields', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'Complete card question',
          answer: 'Complete card answer',
          hint: 'This is a hint',
          courseId: testCourse.id,
          cardType: 'multiple_choice',
          options: ['Option 1', 'Option 2', 'Option 3']
        });

      expect(res.status).toBe(201);
      expect(res.body.data.card.hint).toBe('This is a hint');
      expect(res.body.data.card.cardType).toBe('multiple_choice');
      expect(res.body.data.card.options).toEqual(['Option 1', 'Option 2', 'Option 3']);
    });

    test('should use default cardType if not provided', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'Question',
          answer: 'Answer',
          courseId: testCourse.id
        });

      expect(res.status).toBe(201);
      expect(res.body.data.card.cardType).toBe('basic');
    });

    test('should set userId to current user', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'User test',
          answer: 'User answer',
          courseId: testCourse.id
        });

      expect(res.status).toBe(201);
      expect(res.body.data.card.userId).toBe(user.id);
    });

    test('should reject card without question', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answer: 'Answer',
          courseId: testCourse.id
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    test('should reject card without answer', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'Question',
          courseId: testCourse.id
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    test('should reject card without courseId', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'Question',
          answer: 'Answer'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    test('should reject card creation without authentication', async () => {
      const res = await request(app)
        .post('/api/cards')
        .send({
          question: 'Question',
          answer: 'Answer',
          courseId: testCourse.id
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/cards/:id', () => {
    test('should update card question', async () => {
      const res = await request(app)
        .put(`/api/cards/${testCard1.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'Updated question'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('updated');
      expect(res.body.data.card.question).toBe('Updated question');
    });

    test('should update card answer', async () => {
      const res = await request(app)
        .put(`/api/cards/${testCard1.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answer: 'Updated answer'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.card.answer).toBe('Updated answer');
    });

    test('should update card hint', async () => {
      const res = await request(app)
        .put(`/api/cards/${testCard1.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          hint: 'New hint'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.card.hint).toBe('New hint');
    });

    test('should update card options', async () => {
      const res = await request(app)
        .put(`/api/cards/${testCard1.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          options: ['A', 'B', 'C', 'D']
        });

      expect(res.status).toBe(200);
      expect(res.body.data.card.options).toEqual(['A', 'B', 'C', 'D']);
    });

    test('should update multiple fields at once', async () => {
      const res = await request(app)
        .put(`/api/cards/${testCard1.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'Multi update question',
          answer: 'Multi update answer',
          hint: 'Multi update hint'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.card.question).toBe('Multi update question');
      expect(res.body.data.card.answer).toBe('Multi update answer');
      expect(res.body.data.card.hint).toBe('Multi update hint');
    });

    test('should not update fields not provided', async () => {
      const originalAnswer = testCard1.answer;

      const res = await request(app)
        .put(`/api/cards/${testCard1.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'Only question updated'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.card.question).toBe('Only question updated');
      expect(res.body.data.card.answer).toBe(originalAnswer); // Unchanged
    });

    test('should reject update of non-existent card', async () => {
      const res = await request(app)
        .put('/api/cards/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'Updated'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    test('should reject update of another user\'s card', async () => {
      const otherUser = await User.create({
        username: 'updateother',
        email: 'updateother@example.com',
        password: 'Test123!',
        fullName: 'Update Other'
      });

      const otherCard = await Card.create({
        userId: otherUser.id,
        courseId: testCourse.id,
        question: 'Other user card',
        answer: 'Other answer'
      });

      const res = await request(app)
        .put(`/api/cards/${otherCard.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          question: 'Trying to update'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should reject update without authentication', async () => {
      const res = await request(app)
        .put(`/api/cards/${testCard1.id}`)
        .send({
          question: 'Updated'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cards/:id', () => {
    test('should soft delete card', async () => {
      const res = await request(app)
        .delete(`/api/cards/${testCard1.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted');
    });

    test('should set isActive to false on delete', async () => {
      await request(app)
        .delete(`/api/cards/${testCard1.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      const card = await Card.findByPk(testCard1.id);
      expect(card).toBeDefined();
      expect(card.isActive).toBe(false);
    });

    test('should not actually remove card from database', async () => {
      await request(app)
        .delete(`/api/cards/${testCard1.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      const card = await Card.findByPk(testCard1.id);
      expect(card).not.toBeNull(); // Still exists in database
    });

    test('deleted card should not appear in GET /api/cards', async () => {
      await request(app)
        .delete(`/api/cards/${testCard1.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const deletedCard = res.body.data.cards.find(c => c.id === testCard1.id);
      expect(deletedCard).toBeUndefined();
    });

    test('should reject delete of non-existent card', async () => {
      const res = await request(app)
        .delete('/api/cards/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    test('should reject delete of another user\'s card', async () => {
      const otherUser = await User.create({
        username: 'deleteother',
        email: 'deleteother@example.com',
        password: 'Test123!',
        fullName: 'Delete Other'
      });

      const otherCard = await Card.create({
        userId: otherUser.id,
        courseId: testCourse.id,
        question: 'Other card',
        answer: 'Other answer'
      });

      const res = await request(app)
        .delete(`/api/cards/${otherCard.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should reject delete without authentication', async () => {
      const res = await request(app)
        .delete(`/api/cards/${testCard1.id}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
