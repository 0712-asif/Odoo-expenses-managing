const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('approval_flows', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      expense_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      approver_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      approval_step: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      approver_type: {
        type: DataTypes.ENUM('Manager', 'Finance', 'Admin', 'Director', 'CFO', 'CEO', 'HR', 'Department Head'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Skipped', 'Delegated'),
        defaultValue: 'Pending'
      },
      action_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      notification_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      notification_sent_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      reminder_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      last_reminder_sent: {
        type: DataTypes.DATE,
        allowNull: true
      },
      delegated_to: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      delegated_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      delegation_reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      auto_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      auto_approval_reason: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      priority: {
        type: DataTypes.ENUM('Low', 'Normal', 'High', 'Urgent'),
        defaultValue: 'Normal'
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

    // Add indexes
    const indexes = [
      { fields: ['expense_id', 'approval_step'], options: { name: 'approval_flows_expense_id_approval_step' } },
      { fields: ['approver_id', 'status'], options: { name: 'approval_flows_approver_id_status' } },
      { fields: ['status', 'is_active'], options: { name: 'approval_flows_status_is_active' } },
      { fields: ['delegated_to'], options: { name: 'approval_flows_delegated_to' } },
      { fields: ['due_date'], options: { name: 'approval_flows_due_date' } },
      { fields: ['priority', 'status'], options: { name: 'approval_flows_priority_status' } }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('approval_flows', index.fields, index.options);
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          throw error;
        }
        console.log(`Index ${index.options.name} already exists, skipping...`);
      }
    }

    // Add unique constraint
    try {
      await queryInterface.addIndex('approval_flows', ['expense_id', 'approver_id', 'approval_step'], { 
        unique: true, 
        name: 'unique_expense_approver_step' 
      });
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
      console.log('Unique constraint already exists, skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('approval_flows');
  }
};