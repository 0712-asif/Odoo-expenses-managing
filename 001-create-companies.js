const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create table
    await queryInterface.createTable('companies', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      currency_code: {
        type: DataTypes.STRING(3),
        allowNull: false
      },
      currency_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      currency_symbol: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      admin_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      expense_policy: {
        type: DataTypes.JSON,
        allowNull: true
      },
      approval_settings: {
        type: DataTypes.JSON,
        allowNull: true
      },
      financial_year_start: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: '2025-01-01'
      },
      timezone: {
        type: DataTypes.STRING(50),
        defaultValue: 'UTC'
      },
      logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      website: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Add indexes safely (check if they exist first)
    try {
      await queryInterface.addIndex('companies', ['admin_id'], { name: 'companies_admin_id' });
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
      console.log('Index companies_admin_id already exists, skipping...');
    }

    try {
      await queryInterface.addIndex('companies', ['country'], { name: 'companies_country' });
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
      console.log('Index companies_country already exists, skipping...');
    }

    try {
      await queryInterface.addIndex('companies', ['currency_code'], { name: 'companies_currency_code' });
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
      console.log('Index companies_currency_code already exists, skipping...');
    }

    try {
      await queryInterface.addIndex('companies', ['is_active'], { name: 'companies_is_active' });
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
      console.log('Index companies_is_active already exists, skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('companies');
  }
};