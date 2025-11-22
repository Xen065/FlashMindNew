/**
 * Fix Template Cards - Set userId to null for all template cards
 *
 * Problem: Cards created by teachers were being saved with userId = teacherId
 * Solution: Set userId = null for all cards (template cards should have no userId)
 */

const { Card } = require('./models');

async function fixTemplateCards() {
  try {
    console.log('Starting template cards fix...\n');

    // Find all cards that have a userId (these should be template cards with userId = null)
    const cardsWithUserId = await Card.findAll({
      where: {
        userId: { $ne: null }
      }
    });

    console.log(`Found ${cardsWithUserId.length} cards with userId set (should be null for template cards)`);

    if (cardsWithUserId.length === 0) {
      console.log('No cards to fix!');
      process.exit(0);
    }

    // Update all these cards to have userId = null
    const [updatedCount] = await Card.update(
      { userId: null },
      {
        where: {
          userId: { $ne: null }
        }
      }
    );

    console.log(`\n✅ Successfully updated ${updatedCount} cards to set userId = null`);
    console.log('Template cards are now fixed!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing template cards:', error);
    process.exit(1);
  }
}

fixTemplateCards();
