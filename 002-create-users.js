const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('Admin', 'Manager', 'Employee'),
        defaultValue: 'Employee',
        allowNull: false
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      employee_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      designation: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      date_joined: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null
      },
      avatar_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true
      },
      notification_preferences: {
        type: DataTypes.JSON,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes safely
    const indexes = [
      { fields: ['email'], options: { unique: true, name: 'users_email_unique' } },
      { fields: ['company_id'], options: { name: 'users_company_id' } },
      { fields: ['manager_id'], options: { name: 'users_manager_id' } },
      { fields: ['role'], options: { name: 'users_role' } },
      { fields: ['employee_code'], options: { unique: true, name: 'users_employee_code_unique' } },
      { fields: ['department'], options: { name: 'users_department' } },
      { fields: ['is_active'], options: { name: 'users_is_active' } }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('users', index.fields, index.options);
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          throw error;
        }
        console.log(`Index ${index.options.name} already exists, skipping...`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};