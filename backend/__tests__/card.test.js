/**
 * ============================================
 * Card Model & SM-2 Algorithm Tests
 * ============================================
 * Tests for spaced repetition algorithm and card functionality
 */

const { Card, User, Course } = require('../models');

describe('Card Model - SM-2 Spaced Repetition Algorithm', () => {
  let testUser;
  let testCourse;
  let testCard;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      username: 'cardtestuser',
      email: 'cardtest@example.com',
      password: 'Test123!',
      fullName: 'Card Test User'
    });

    // Create test course
    testCourse = await Course.create({
      title: 'Test Course',
      description: 'Test course for card tests',
      instructorId: testUser.id,
      isPublic: true
    });

    // Create test card
    testCard = await Card.create({
      userId: testUser.id,
      courseId: testCourse.id,
      question: 'What is spaced repetition?',
      answer: 'A learning technique that incorporates increasing intervals of time between subsequent review of previously learned material',
      cardType: 'basic'
    });
  });

  describe('calculateNextReview - Basic Functionality', () => {
    test('should return correct structure with all required fields', () => {
      const result = testCard.calculateNextReview(3);

      expect(result).toHaveProperty('easeFactor');
      expect(result).toHaveProperty('interval');
      expect(result).toHaveProperty('repetitions');
      expect(result).toHaveProperty('nextReviewDate');
      expect(result).toHaveProperty('lastReviewDate');
      expect(result.nextReviewDate).toBeInstanceOf(Date);
      expect(result.lastReviewDate).toBeInstanceOf(Date);
    });

    test('should handle quality rating of 1 (Again)', () => {
      const result = testCard.calculateNextReview(1);

      expect(result.repetitions).toBe(0); // Reset to 0
      expect(result.interval).toBe(1); // Back to first interval
    });

    test('should handle quality rating of 2 (Hard)', () => {
      const result = testCard.calculateNextReview(2);

      expect(result.repetitions).toBe(0); // Reset to 0
      expect(result.interval).toBe(1); // Back to first interval
    });

    test('should handle quality rating of 3 (Good)', () => {
      const result = testCard.calculateNextReview(3);

      expect(result.repetitions).toBe(1); // Increment repetitions
      expect(result.interval).toBe(1); // First correct answer: 1 day
    });

    test('should handle quality rating of 4 (Easy)', () => {
      const result = testCard.calculateNextReview(4);

      expect(result.repetitions).toBe(1); // Increment repetitions
      expect(result.interval).toBe(1); // First correct answer: 1 day
      expect(result.easeFactor).toBe(2.5); // Ease factor stays at max (2.5)
    });
  });

  describe('calculateNextReview - Interval Progression', () => {
    test('should use 1 day interval for first correct answer (normal mode)', () => {
      const result = testCard.calculateNextReview(3, 'normal');

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    test('should use 4 days interval for second correct answer (normal mode)', () => {
      // First review
      let result = testCard.calculateNextReview(3, 'normal');
      testCard.easeFactor = result.easeFactor;
      testCard.interval = result.interval;
      testCard.repetitions = result.repetitions;

      // Second review
      result = testCard.calculateNextReview(3, 'normal');

      expect(result.interval).toBe(4);
      expect(result.repetitions).toBe(2);
    });

    test('should calculate interval based on ease factor for subsequent reviews', () => {
      // First review
      let result = testCard.calculateNextReview(3, 'normal');
      testCard.easeFactor = result.easeFactor;
      testCard.interval = result.interval;
      testCard.repetitions = result.repetitions;

      // Second review
      result = testCard.calculateNextReview(3, 'normal');
      testCard.easeFactor = result.easeFactor;
      testCard.interval = result.interval;
      testCard.repetitions = result.repetitions;

      // Third review
      result = testCard.calculateNextReview(3, 'normal');

      expect(result.repetitions).toBe(3);
      expect(result.interval).toBeGreaterThan(4); // Should be greater than second interval
    });

    test('should reset interval to 1 on incorrect answer', () => {
      // Build up some progress
      let result = testCard.calculateNextReview(3, 'normal');
      testCard.easeFactor = result.easeFactor;
      testCard.interval = result.interval;
      testCard.repetitions = result.repetitions;

      result = testCard.calculateNextReview(3, 'normal');
      testCard.easeFactor = result.easeFactor;
      testCard.interval = result.interval;
      testCard.repetitions = result.repetitions;

      // Now fail the card
      result = testCard.calculateNextReview(1, 'normal');

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });
  });

  describe('calculateNextReview - Ease Factor Calculations', () => {
    test('should start with default ease factor of 2.5', () => {
      expect(testCard.easeFactor).toBe(2.5);
    });

    test('should keep ease factor at max (2.5) on quality 4 (Easy)', () => {
      const result = testCard.calculateNextReview(4);

      // Formula: EF = 2.5 + (0.1 - (4-4) * ...) = 2.5 + 0.1 = 2.6, but capped at 2.5
      expect(result.easeFactor).toBe(2.5); // Stays at max
      expect(result.easeFactor).toBeLessThanOrEqual(2.5); // Max is 2.5
    });

    test('should decrease ease factor on quality 1 (Again)', () => {
      const result = testCard.calculateNextReview(1);

      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3); // Min is 1.3
    });

    test('should keep ease factor within bounds (1.3 - 2.5)', () => {
      // Test lower bound
      testCard.easeFactor = 1.3;
      let result = testCard.calculateNextReview(1); // Very hard
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);

      // Test upper bound
      testCard.easeFactor = 2.5;
      result = testCard.calculateNextReview(4); // Very easy
      expect(result.easeFactor).toBeLessThanOrEqual(2.5);
    });

    test('should correctly calculate ease factor with formula', () => {
      const initialEF = 2.5;
      const quality = 3;

      const result = testCard.calculateNextReview(quality);

      // Formula: EF = EF + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02))
      // For quality 3: EF = 2.5 + (0.1 - 1 * (0.08 + 1 * 0.02))
      //              = 2.5 + (0.1 - 1 * 0.1)
      //              = 2.5 + 0 = 2.5
      expect(result.easeFactor).toBe(2.5);
    });
  });

  describe('calculateNextReview - Frequency Modes', () => {
    test('intensive mode: should use shorter intervals', () => {
      const intensiveResult = testCard.calculateNextReview(3, 'intensive');

      expect(intensiveResult.interval).toBe(1); // First: 1 day

      // Apply result and test second review
      testCard.easeFactor = intensiveResult.easeFactor;
      testCard.interval = intensiveResult.interval;
      testCard.repetitions = intensiveResult.repetitions;

      const secondReview = testCard.calculateNextReview(3, 'intensive');
      expect(secondReview.interval).toBe(3); // Second: 3 days (vs 4 in normal)
    });

    test('normal mode: should use standard intervals', () => {
      const normalResult = testCard.calculateNextReview(3, 'normal');

      expect(normalResult.interval).toBe(1); // First: 1 day

      // Apply result and test second review
      testCard.easeFactor = normalResult.easeFactor;
      testCard.interval = normalResult.interval;
      testCard.repetitions = normalResult.repetitions;

      const secondReview = testCard.calculateNextReview(3, 'normal');
      expect(secondReview.interval).toBe(4); // Second: 4 days
    });

    test('relaxed mode: should use longer intervals', () => {
      const relaxedResult = testCard.calculateNextReview(3, 'relaxed');

      expect(relaxedResult.interval).toBe(2); // First: 2 days (vs 1 in normal)

      // Apply result and test second review
      testCard.easeFactor = relaxedResult.easeFactor;
      testCard.interval = relaxedResult.interval;
      testCard.repetitions = relaxedResult.repetitions;

      const secondReview = testCard.calculateNextReview(3, 'relaxed');
      expect(secondReview.interval).toBe(7); // Second: 7 days (vs 4 in normal)
    });

    test('should apply correct multiplier for subsequent reviews', () => {
      // Set up card with repetitions > 1
      testCard.repetitions = 2;
      testCard.interval = 4;
      testCard.easeFactor = 2.5;

      // Normal mode (multiplier 1.0)
      const normalResult = testCard.calculateNextReview(3, 'normal');
      const normalInterval = normalResult.interval;

      // Reset card
      testCard.repetitions = 2;
      testCard.interval = 4;
      testCard.easeFactor = 2.5;

      // Intensive mode (multiplier 0.8)
      const intensiveResult = testCard.calculateNextReview(3, 'intensive');

      // Intensive should have shorter interval
      expect(intensiveResult.interval).toBeLessThan(normalInterval);

      // Reset card
      testCard.repetitions = 2;
      testCard.interval = 4;
      testCard.easeFactor = 2.5;

      // Relaxed mode (multiplier 1.2)
      const relaxedResult = testCard.calculateNextReview(3, 'relaxed');

      // Relaxed should have longer interval
      expect(relaxedResult.interval).toBeGreaterThan(normalInterval);
    });

    test('should default to normal mode if invalid mode provided', () => {
      const result = testCard.calculateNextReview(3, 'invalid-mode');

      // Should behave like normal mode
      expect(result.interval).toBe(1); // First interval in normal mode
    });
  });

  describe('calculateNextReview - Edge Cases', () => {
    test('should clamp quality to valid range (1-4)', () => {
      // Quality too high
      const highResult = testCard.calculateNextReview(10);
      expect(highResult.repetitions).toBeGreaterThan(0); // Should treat as correct

      // Quality too low
      testCard.repetitions = 0;
      const lowResult = testCard.calculateNextReview(-5);
      expect(lowResult.repetitions).toBe(0); // Should treat as incorrect
    });

    test('should handle nextReviewDate calculation correctly', () => {
      const beforeDate = new Date();
      const result = testCard.calculateNextReview(3);
      const afterDate = new Date();

      // Next review should be in the future
      expect(result.nextReviewDate.getTime()).toBeGreaterThan(beforeDate.getTime());

      // Should be approximately interval days in the future
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + result.interval);

      const timeDiff = Math.abs(result.nextReviewDate.getTime() - expectedDate.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    test('should set lastReviewDate to current time', () => {
      const beforeDate = new Date();
      const result = testCard.calculateNextReview(3);
      const afterDate = new Date();

      expect(result.lastReviewDate.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
      expect(result.lastReviewDate.getTime()).toBeLessThanOrEqual(afterDate.getTime());
    });

    test('should round interval to nearest integer', () => {
      testCard.repetitions = 2;
      testCard.interval = 4;
      testCard.easeFactor = 2.3; // Will create non-integer interval

      const result = testCard.calculateNextReview(3, 'normal');

      expect(Number.isInteger(result.interval)).toBe(true);
    });

    test('should format ease factor to 2 decimal places', () => {
      const result = testCard.calculateNextReview(3);

      const decimalPlaces = (result.easeFactor.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  describe('Card Creation and Validation', () => {
    test('should create card with default values', async () => {
      const newCard = await Card.create({
        userId: testUser.id,
        courseId: testCourse.id,
        question: 'New question',
        answer: 'New answer'
      });

      expect(newCard.easeFactor).toBe(2.5);
      expect(newCard.interval).toBe(0);
      expect(newCard.repetitions).toBe(0);
      expect(newCard.status).toBe('new');
      expect(newCard.timesReviewed).toBe(0);
      expect(newCard.timesCorrect).toBe(0);
      expect(newCard.timesIncorrect).toBe(0);
    });

    test('should create card with tags as JSON array', async () => {
      const newCard = await Card.create({
        userId: testUser.id,
        courseId: testCourse.id,
        question: 'Tagged question',
        answer: 'Tagged answer',
        tags: ['science', 'biology', 'cells']
      });

      expect(Array.isArray(newCard.tags)).toBe(true);
      expect(newCard.tags).toEqual(['science', 'biology', 'cells']);
    });

    test('should handle empty tags array', async () => {
      const newCard = await Card.create({
        userId: testUser.id,
        courseId: testCourse.id,
        question: 'No tags question',
        answer: 'No tags answer',
        tags: []
      });

      expect(Array.isArray(newCard.tags)).toBe(true);
      expect(newCard.tags).toEqual([]);
    });

    test('should require question and courseId', async () => {
      await expect(
        Card.create({
          userId: testUser.id,
          answer: 'Answer without question'
        })
      ).rejects.toThrow();
    });
  });

  describe('SM-2 Algorithm - Complete Learning Cycle', () => {
    test('should progress through complete learning cycle', async () => {
      let card = await Card.create({
        userId: testUser.id,
        courseId: testCourse.id,
        question: 'Complete cycle test',
        answer: 'Learning progression'
      });

      // Review 1: Good (quality 3)
      let result = card.calculateNextReview(3, 'normal');
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);

      // Apply changes
      card.easeFactor = result.easeFactor;
      card.interval = result.interval;
      card.repetitions = result.repetitions;

      // Review 2: Good (quality 3)
      result = card.calculateNextReview(3, 'normal');
      expect(result.interval).toBe(4);
      expect(result.repetitions).toBe(2);

      // Apply changes
      card.easeFactor = result.easeFactor;
      card.interval = result.interval;
      card.repetitions = result.repetitions;

      // Review 3: Easy (quality 4)
      result = card.calculateNextReview(4, 'normal');
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBeGreaterThan(4);

      // Apply changes
      card.easeFactor = result.easeFactor;
      card.interval = result.interval;
      card.repetitions = result.repetitions;

      // Review 4: Fail (quality 1) - Reset
      result = card.calculateNextReview(1, 'normal');
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });
  });
});
