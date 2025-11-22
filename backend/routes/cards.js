/**
 * ============================================
 * Card Routes (Flashcards)
 * ============================================
 * Flashcard CRUD operations
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const { Card, Course } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/cards
 * @desc    Get user's cards
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { courseId, status, limit = 100 } = req.query;

    const where = { userId: req.user.id, isActive: true };

    if (courseId) {
      where.courseId = courseId;
    }

    if (status) {
      where.status = status;
    }

    const cards = await Card.findAll({
      where,
      limit: parseInt(limit),
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'icon', 'color']
      }],
      order: [['nextReviewDate', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        cards,
        count: cards.length
      }
    });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cards'
    });
  }
});

/**
 * @route   GET /api/cards/due
 * @desc    Get cards due for review
 * @access  Private
 */
router.get('/due', protect, async (req, res) => {
  try {
    const { courseId, limit = 20 } = req.query;

    const where = {
      userId: req.user.id,
      isActive: true,
      isSuspended: false,
      nextReviewDate: {
        [Op.lte]: new Date()
      }
    };

    if (courseId) {
      where.courseId = courseId;
    }

    const dueCards = await Card.findAll({
      where,
      limit: parseInt(limit),
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'icon', 'color']
      }],
      order: [['nextReviewDate', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        cards: dueCards,
        count: dueCards.length
      }
    });
  } catch (error) {
    console.error('Get due cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching due cards'
    });
  }
});

/**
 * @route   POST /api/cards
 * @desc    Create a new card
 * @access  Private
 */
router.post('/', protect, [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ max: 5000 })
    .withMessage('Question must not exceed 5000 characters')
    .escape(),
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ max: 5000 })
    .withMessage('Answer must not exceed 5000 characters')
    .escape(),
  body('hint')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Hint must not exceed 1000 characters')
    .escape(),
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a valid positive integer'),
  body('cardType')
    .optional()
    .isIn(['basic', 'multiple_choice', 'true_false', 'fill_blank'])
    .withMessage('Card type must be one of: basic, multiple_choice, true_false, fill_blank'),
  body('options')
    .optional()
    .isArray()
    .withMessage('Options must be an array')
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error('Options array must not exceed 10 items');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { question, answer, hint, courseId, cardType, options } = req.body;

    const card = await Card.create({
      question,
      answer,
      hint,
      courseId,
      userId: req.user.id,
      cardType: cardType || 'basic',
      options: options || null
    });

    res.status(201).json({
      success: true,
      message: 'Card created successfully',
      data: {
        card
      }
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating card'
    });
  }
});

/**
 * @route   PUT /api/cards/:id
 * @desc    Update a card
 * @access  Private
 */
router.put('/:id', protect, [
  body('question')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Question must be between 1 and 5000 characters')
    .escape(),
  body('answer')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Answer must be between 1 and 5000 characters')
    .escape(),
  body('hint')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Hint must not exceed 1000 characters')
    .escape(),
  body('options')
    .optional()
    .isArray()
    .withMessage('Options must be an array')
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error('Options array must not exceed 10 items');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const card = await Card.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const { question, answer, hint, options } = req.body;

    if (question !== undefined) card.question = question;
    if (answer !== undefined) card.answer = answer;
    if (hint !== undefined) card.hint = hint;
    if (options !== undefined) card.options = options;

    await card.save();

    res.json({
      success: true,
      message: 'Card updated successfully',
      data: {
        card
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating card'
    });
  }
});

/**
 * @route   DELETE /api/cards/:id
 * @desc    Delete a card (soft delete)
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    card.isActive = false;
    await card.save();

    res.json({
      success: true,
      message: 'Card deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting card'
    });
  }
});

module.exports = router;
