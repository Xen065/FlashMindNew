const express = require('express');
const router = express.Router();
const { Course } = require('../models');
const { Sequelize } = require('sequelize');

/**
 * @route   GET /api/public/courses
 * @desc    Get featured/published courses for public viewing (no auth required)
 * @access  Public
 */
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: {
        isPublished: true,
        isActive: true
      },
      attributes: [
        'id',
        'title',
        'description',
        'icon',
        'color',
        'category',
        'difficulty',
        'totalCards',
        'isFree',
        'isFeatured',
        'createdAt'
      ],
      order: [
        ['isFeatured', 'DESC'], // Featured courses first
        ['createdAt', 'DESC']   // Then by newest
      ],
      limit: 12 // Limit to 12 courses for homepage
    });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching public courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

/**
 * @route   GET /api/public/courses/:id
 * @desc    Get single course details for public viewing (no auth required)
 * @access  Public
 */
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findOne({
      where: {
        id: req.params.id,
        isPublished: true,
        isActive: true
      },
      attributes: [
        'id',
        'title',
        'description',
        'icon',
        'color',
        'category',
        'difficulty',
        'totalCards',
        'activeCards',
        'isFree',
        'price',
        'priceType',
        'enrollmentCount',
        'createdAt'
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course details'
    });
  }
});

/**
 * @route   GET /api/public/stats
 * @desc    Get platform statistics for homepage (no auth required)
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const { User, Card } = require('../models');

    const [courseCount, userCount, cardCount] = await Promise.all([
      Course.count({ where: { isPublished: true, isActive: true } }),
      User.count({ where: { isActive: true } }),
      Card.count({ where: { isActive: true } })
    ]);

    res.json({
      courses: courseCount,
      students: userCount,
      flashcards: cardCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

module.exports = router;
