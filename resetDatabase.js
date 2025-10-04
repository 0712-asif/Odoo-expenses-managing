const { sequelize } = require('../models');

const resetDatabase = async () => {
  try {
    console.log('ðŸ”„ Resetting database...');

    // Force sync - this will drop and recreate all tables
    await sequelize.sync({ force: true });

    console.log('âœ… Database reset completed!');
    console.log('ðŸ“‹ All tables dropped and recreated');
    console.log('ðŸš€ Now you can run: npm run seed');

  } catch (error) {
    console.error('âŒ Error resetting database:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

resetDatabase();