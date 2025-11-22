/**
 * Direct SQL fix for template cards
 * This script connects directly to PostgreSQL and fixes the userId field
 */

const { Client } = require('pg');
require('dotenv').config();

async function fixCards() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'flashmind',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || '')
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');

    // First, check how many cards need fixing
    const countResult = await client.query(
      'SELECT COUNT(*) FROM cards WHERE user_id IS NOT NULL'
    );
    const count = parseInt(countResult.rows[0].count);

    console.log(`\nFound ${count} cards with user_id set (should be null for template cards)`);

    if (count === 0) {
      console.log('No cards to fix!');
      await client.end();
      return;
    }

    // Show some examples
    const examplesResult = await client.query(
      'SELECT id, user_id, question FROM cards WHERE user_id IS NOT NULL LIMIT 5'
    );
    console.log('\nExample cards that will be fixed:');
    examplesResult.rows.forEach(card => {
      console.log(`  - Card ID: ${card.id}, user_id: ${card.user_id}, question: ${card.question.substring(0, 50)}...`);
    });

    // Fix the cards
    console.log('\nFixing cards...');
    const updateResult = await client.query(
      'UPDATE cards SET user_id = NULL WHERE user_id IS NOT NULL'
    );

    console.log(`\n✅ Successfully updated ${updateResult.rowCount} cards!`);
    console.log('All template cards now have user_id = NULL');

    // Verify the fix
    const verifyResult = await client.query(
      'SELECT COUNT(*) FROM cards WHERE user_id IS NOT NULL'
    );
    const remaining = parseInt(verifyResult.rows[0].count);

    if (remaining === 0) {
      console.log('\n✅ Verification passed: All cards now have user_id = NULL');
    } else {
      console.log(`\n⚠️ Warning: ${remaining} cards still have user_id set`);
    }

    await client.end();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
    try {
      await client.end();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

fixCards();
