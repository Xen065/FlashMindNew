const { Card, Course } = require('./models');

async function checkCards() {
  try {
    console.log('Checking cards in database...\n');

    // Get all cards with userId = null (template cards)
    const templateCards = await Card.findAll({
      where: { userId: null },
      include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    console.log(`Found ${templateCards.length} template cards (userId = null):`);
    templateCards.forEach(card => {
      console.log(`- ID: ${card.id}, Course: ${card.course?.title}, Question: ${card.question.substring(0, 50)}...`);
    });

    console.log('\n---\n');

    // Get total count of all cards
    const totalCards = await Card.count();
    console.log(`Total cards in database: ${totalCards}`);

    // Get count by userId
    const templateCount = await Card.count({ where: { userId: null } });
    const studentCount = await Card.count({ where: { userId: { $ne: null } } });

    console.log(`- Template cards (userId = null): ${templateCount}`);
    console.log(`- Student cards (userId != null): ${studentCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCards();
