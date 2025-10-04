const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('expenses', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
      },
      converted_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      exchange_rate: {
        type: DataTypes.DECIMAL(10, 6),
        defaultValue: 1.000000
      },
      category: {
        type: DataTypes.ENUM('Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Marketing', 'Training', 'Entertainment', 'Other'),
        allowNull: false
      },
      expense_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      submitted_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('Draft', 'Submitted', 'Under Review', 'Partially Approved', 'Approved', 'Rejected', 'Cancelled'),
        defaultValue: 'Submitted'
      },
      current_approver_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      approval_step: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      receipt_filename: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      receipt_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      receipt_mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      receipt_size: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      ocr_extracted_text: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ocr_extracted_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
      },
      ocr_confidence: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      submitted_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      approved_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      total_approvers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      approved_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      rejected_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      expense_reference: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true
      },
      metadata: {
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

    // Add indexes
    const indexes = [
      { fields: ['submitted_by', 'status'], options: { name: 'expenses_submitted_by_status' } },
      { fields: ['company_id', 'status'], options: { name: 'expenses_company_id_status' } },
      { fields: ['expense_date'], options: { name: 'expenses_expense_date' } },
      { fields: ['current_approver_id'], options: { name: 'expenses_current_approver_id' } },
      { fields: ['status', 'approval_step'], options: { name: 'expenses_status_approval_step' } },
      { fields: ['category'], options: { name: 'expenses_category' } },
      { fields: ['expense_reference'], options: { unique: true, name: 'expenses_expense_reference_unique' } },
      { fields: ['submitted_date'], options: { name: 'expenses_submitted_date' } }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('expenses', index.fields, index.options);
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          throw error;
        }
        console.log(`Index ${index.options.name} already exists, skipping...`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('expenses');
  }
};