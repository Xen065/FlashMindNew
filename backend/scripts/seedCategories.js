/**
 * Seed Script for Course Categories
 *
 * Run this script to populate initial course categories:
 * node backend/scripts/seedCategories.js
 */

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sequelize = require('../config/database');
const { CourseCategory } = require('../models');

const initialCategories = [
  {
    name: 'UPSC / OPSC',
    icon: '🏛️',
    color: '#6366F1',
    description: 'Union Public Service Commission and Odisha Public Service Commission exam preparation',
    orderIndex: 1,
    children: [
      {
        name: 'Prelims',
        icon: '📝',
        color: '#8B5CF6',
        description: 'UPSC/OPSC Preliminary examination preparation',
        orderIndex: 1
      },
      {
        name: 'Mains',
        icon: '📚',
        color: '#EC4899',
        description: 'UPSC/OPSC Mains examination preparation',
        orderIndex: 2
      },
      {
        name: 'Optional Subjects',
        icon: '🎯',
        color: '#F59E0B',
        description: 'Optional subject preparation for UPSC/OPSC',
        orderIndex: 3
      }
    ]
  },
  {
    name: 'NEET',
    icon: '🏥',
    color: '#10B981',
    description: 'National Eligibility cum Entrance Test for medical courses',
    orderIndex: 2,
    children: [
      {
        name: 'Physics',
        icon: '⚛️',
        color: '#3B82F6',
        description: 'NEET Physics preparation',
        orderIndex: 1
      },
      {
        name: 'Chemistry',
        icon: '🧪',
        color: '#8B5CF6',
        description: 'NEET Chemistry preparation',
        orderIndex: 2
      },
      {
        name: 'Biology',
        icon: '🧬',
        color: '#10B981',
        description: 'NEET Biology preparation',
        orderIndex: 3
      }
    ]
  },
  {
    name: 'SSC',
    icon: '📊',
    color: '#EF4444',
    description: 'Staff Selection Commission exam preparation',
    orderIndex: 3,
    children: [
      {
        name: 'SSC CGL',
        icon: '💼',
        color: '#F59E0B',
        description: 'Combined Graduate Level Examination',
        orderIndex: 1
      },
      {
        name: 'SSC CHSL',
        icon: '📋',
        color: '#EC4899',
        description: 'Combined Higher Secondary Level',
        orderIndex: 2
      },
      {
        name: 'SSC MTS',
        icon: '🔧',
        color: '#6366F1',
        description: 'Multi-Tasking Staff',
        orderIndex: 3
      }
    ]
  },
  {
    name: 'OSSC',
    icon: '🏛️',
    color: '#8B5CF6',
    description: 'Odisha Staff Selection Commission exam preparation',
    orderIndex: 4,
    children: [
      {
        name: 'Junior Clerk',
        icon: '📝',
        color: '#3B82F6',
        description: 'Junior Clerk examination',
        orderIndex: 1
      },
      {
        name: 'Block Social Security Officer',
        icon: '👥',
        color: '#10B981',
        description: 'BSSO examination preparation',
        orderIndex: 2
      }
    ]
  },
  {
    name: 'Engineering',
    icon: '⚙️',
    color: '#F59E0B',
    description: 'Engineering entrance exams and courses',
    orderIndex: 5,
    children: [
      {
        name: 'JEE Main',
        icon: '🎓',
        color: '#EF4444',
        description: 'Joint Entrance Examination Main',
        orderIndex: 1
      },
      {
        name: 'JEE Advanced',
        icon: '🏆',
        color: '#EC4899',
        description: 'Joint Entrance Examination Advanced',
        orderIndex: 2
      }
    ]
  }
];

async function seedCategories() {
  try {
    console.log('🌱 Starting to seed course categories...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models (create tables if they don't exist)
    await sequelize.sync();
    console.log('✅ Models synced');

    // Check if categories already exist
    const existingCount = await CourseCategory.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing categories. Skipping seed.`);
      console.log('   To re-seed, delete existing categories first.');
      process.exit(0);
    }

    // Create parent categories and their children
    for (const categoryData of initialCategories) {
      const { children, ...parentData } = categoryData;

      // Create parent category
      const parentCategory = await CourseCategory.create(parentData);
      console.log(`✅ Created parent category: ${parentCategory.name}`);

      // Create child categories
      if (children && children.length > 0) {
        for (const childData of children) {
          const childCategory = await CourseCategory.create({
            ...childData,
            parentId: parentCategory.id
          });
          console.log(`   ↳ Created child category: ${childCategory.name}`);
        }
      }
    }

    console.log('\n🎉 Successfully seeded all course categories!');
    console.log(`📊 Total categories created: ${await CourseCategory.count()}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCategories();
