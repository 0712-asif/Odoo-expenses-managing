const mysql = require('mysql2/promise');
require('dotenv').config();

const cleanReset = async () => {
  let connection;

  try {
    console.log('ðŸ”„ Starting clean database reset...');

    // Connect to MySQL server (not to specific database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'your_password'
    });

    console.log('âœ… Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'expense_management';

    // Drop database if exists
    await connection.execute(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log(`ðŸ—‘ï¸ Dropped database: ${dbName}`);

    // Create fresh database
    await connection.execute(`CREATE DATABASE \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`ðŸ†• Created fresh database: ${dbName}`);

    console.log('\nðŸŽ‰ Clean reset completed!');
    console.log('ðŸ“‹ Next steps:');
    console.log('   1. npm run migrate');
    console.log('   2. npm run seed');

  } catch (error) {
    console.error('âŒ Error during clean reset:', error.message);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\nðŸ” Database credentials issue!');
      console.log('   Check your .env file or config/config.json');
      console.log('   Make sure MySQL username/password are correct');
    }

  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
};

cleanReset();