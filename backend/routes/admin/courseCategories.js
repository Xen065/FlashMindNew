/**
 * ============================================
 * Admin Course Category Routes
 * ============================================
 * Admin routes for course category management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/rbac');
const { CourseCategory, Course } = require('../../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/admin/course-categories
 * @desc    Get all course categories (flat list with parent info)
 * @access  Admin, SuperAdmin
 */
router.get(
  '/',
  protect,
  requireAdmin(),
  async (req, res) => {
    try {
      const categories = await CourseCategory.findAll({
        order: [['parentId', 'ASC'], ['orderIndex', 'ASC'], ['name', 'ASC']],
        include: [
          {
            model: CourseCategory,
            as: 'parent',
            attributes: ['id', 'name']
          }
        ]
      });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching course categories'
      });
    }
  }
);

/**
 * @route   GET /api/admin/course-categories/tree
 * @desc    Get hierarchical category tree for management
 * @access  Admin, SuperAdmin
 */
router.get(
  '/tree',
  protect,
  requireAdmin(),
  async (req, res) => {
    try {
      const categoryTree = await CourseCategory.getFullTree();

      res.json({
        success: true,
        data: categoryTree
      });
    } catch (error) {
      console.error('Error fetching category tree:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching category tree'
      });
    }
  }
);

/**
 * @route   GET /api/admin/course-categories/:id
 * @desc    Get single category with details
 * @access  Admin, SuperAdmin
 */
router.get(
  '/:id',
  protect,
  requireAdmin(),
  async (req, res) => {
    try {
      const category = await CourseCategory.findByPk(req.params.id, {
        include: [
          {
            model: CourseCategory,
            as: 'parent',
            attributes: ['id', 'name']
          },
          {
            model: CourseCategory,
            as: 'children',
            attributes: ['id', 'name', 'icon', 'orderIndex']
          }
        ]
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching category'
      });
    }
  }
);

/**
 * @route   POST /api/admin/course-categories
 * @desc    Create new category
 * @access  Admin, SuperAdmin
 */
router.post(
  '/',
  protect,
  requireAdmin(),
  async (req, res) => {
    try {
      const { name, description, icon, color, parentId, orderIndex, isActive } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Category name is required'
        });
      }

      // If parentId is provided, verify it exists
      if (parentId) {
        const parentCategory = await CourseCategory.findByPk(parentId);
        if (!parentCategory) {
          return res.status(404).json({
            success: false,
            error: 'Parent category not found'
          });
        }
      }

      const category = await CourseCategory.create({
        name,
        description,
        icon: icon || '📂',
        color: color || '#6366F1',
        parentId: parentId || null,
        orderIndex: orderIndex || 0,
        isActive: isActive !== undefined ? isActive : true
      });

      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully'
      });
    } catch (error) {
      console.error('Error creating category:', error);

      // Handle unique constraint violation for slug
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          error: 'A category with a similar name already exists'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error creating category'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/course-categories/:id
 * @desc    Update category
 * @access  Admin, SuperAdmin
 */
router.put(
  '/:id',
  protect,
  requireAdmin(),
  async (req, res) => {
    try {
      const category = await CourseCategory.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      const { name, description, icon, color, parentId, orderIndex, isActive } = req.body;

      // Prevent circular relationships
      if (parentId) {
        if (parseInt(parentId) === parseInt(req.params.id)) {
          return res.status(400).json({
            success: false,
            error: 'Category cannot be its own parent'
          });
        }

        // Check if the new parent is a descendant of this category
        const newParent = await CourseCategory.findByPk(parentId);
        if (newParent) {
          const descendants = await category.getAllDescendants();
          if (descendants.some(desc => desc.id === parseInt(parentId))) {
            return res.status(400).json({
              success: false,
              error: 'Cannot move category to its own descendant'
            });
          }
        }
      }

      // Update fields
      if (name !== undefined) category.name = name;
      if (description !== undefined) category.description = description;
      if (icon !== undefined) category.icon = icon;
      if (color !== undefined) category.color = color;
      if (parentId !== undefined) category.parentId = parentId || null;
      if (orderIndex !== undefined) category.orderIndex = orderIndex;
      if (isActive !== undefined) category.isActive = isActive;

      // Force slug regeneration if name changed
      if (name !== undefined) {
        category.slug = null;
      }

      await category.save();

      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully'
      });
    } catch (error) {
      console.error('Error updating category:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          error: 'A category with a similar name already exists'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error updating category'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/course-categories/:id/reorder
 * @desc    Update category order
 * @access  Admin, SuperAdmin
 */
router.put(
  '/:id/reorder',
  protect,
  requireAdmin(),
  async (req, res) => {
    try {
      const { orderIndex } = req.body;

      if (orderIndex === undefined) {
        return res.status(400).json({
          success: false,
          error: 'orderIndex is required'
        });
      }

      const category = await CourseCategory.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      category.orderIndex = parseInt(orderIndex);
      await category.save();

      res.json({
        success: true,
        data: category,
        message: 'Category order updated successfully'
      });
    } catch (error) {
      console.error('Error reordering category:', error);
      res.status(500).json({
        success: false,
        error: 'Error reordering category'
      });
    }
  }
);

/**
 * @route   DELETE /api/admin/course-categories/:id
 * @desc    Delete category (only if no courses assigned)
 * @access  Admin, SuperAdmin
 */
router.delete(
  '/:id',
  protect,
  requireAdmin(),
  async (req, res) => {
    try {
      const category = await CourseCategory.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Check if category has courses
      const coursesCount = await Course.count({
        where: { categoryId: req.params.id }
      });

      if (coursesCount > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete category with ${coursesCount} course(s). Please reassign or delete the courses first.`
        });
      }

      // Check if category has children
      const children = await category.getChildren();
      if (children.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete category with ${children.length} subcategory(ies). Please delete or move the subcategories first.`
        });
      }

      await category.destroy();

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting category'
      });
    }
  }
);

module.exports = router;
