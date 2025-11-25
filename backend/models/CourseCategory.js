/**
 * ============================================
 * CourseCategory Model
 * ============================================
 * Represents a hierarchical category system for courses
 * Supports unlimited nesting levels with self-referential relationship
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseCategory = sequelize.define('CourseCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Category Information
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },

  slug: {
    type: DataTypes.STRING(120),
    allowNull: true,
    unique: true,
    comment: 'URL-friendly version of name'
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '📂',
    comment: 'Emoji or icon name'
  },

  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#6366F1',
    validate: {
      is: /^#[0-9A-F]{6}$/i  // Hex color code validation
    }
  },

  // Hierarchical Structure
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
    references: {
      model: 'course_categories',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Parent category ID for nested structure'
  },

  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'order_index',
    comment: 'Order of display within the same parent level'
  },

  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: 'Whether this category is visible in the dropdown'
  },

  // Metadata
  courseCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'course_count',
    validate: {
      min: 0
    },
    comment: 'Number of courses directly in this category'
  },

  // Timestamps (createdAt and updatedAt are added automatically)

}, {
  tableName: 'course_categories',
  timestamps: true,
  indexes: [
    {
      fields: ['parent_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['order_index']
    },
    {
      fields: ['slug'],
      unique: true
    }
  ],
  hooks: {
    // Generate slug before create/update if not provided
    beforeValidate: (category) => {
      if (!category.slug && category.name) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    }
  }
});

// Instance Methods
CourseCategory.prototype.getChildren = async function() {
  return await CourseCategory.findAll({
    where: { parentId: this.id, isActive: true },
    order: [['orderIndex', 'ASC'], ['name', 'ASC']]
  });
};

CourseCategory.prototype.getAllDescendants = async function() {
  const descendants = [];
  const children = await this.getChildren();

  for (const child of children) {
    descendants.push(child);
    const childDescendants = await child.getAllDescendants();
    descendants.push(...childDescendants);
  }

  return descendants;
};

CourseCategory.prototype.getParents = async function() {
  const parents = [];
  let current = this;

  while (current.parentId) {
    current = await CourseCategory.findByPk(current.parentId);
    if (current) {
      parents.unshift(current);
    }
  }

  return parents;
};

CourseCategory.prototype.getLevel = async function() {
  const parents = await this.getParents();
  return parents.length;
};

// Static Methods
CourseCategory.getRootCategories = async function() {
  return await CourseCategory.findAll({
    where: { parentId: null, isActive: true },
    order: [['orderIndex', 'ASC'], ['name', 'ASC']]
  });
};

CourseCategory.buildTree = async function(parentId = null) {
  const categories = await CourseCategory.findAll({
    where: { parentId, isActive: true },
    order: [['orderIndex', 'ASC'], ['name', 'ASC']]
  });

  const tree = [];
  for (const category of categories) {
    const node = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      color: category.color,
      description: category.description,
      courseCount: category.courseCount,
      children: await CourseCategory.buildTree(category.id)
    };
    tree.push(node);
  }

  return tree;
};

CourseCategory.getFullTree = async function() {
  return await CourseCategory.buildTree(null);
};

module.exports = CourseCategory;
