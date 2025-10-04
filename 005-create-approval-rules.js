const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('approval_rules', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      rule_type: {
        type: DataTypes.ENUM('Amount', 'Category', 'Department', 'Percentage', 'Specific_Approver', 'Hybrid', 'Role_Based', 'Time_Based'),
        allowNull: false
      },
      condition_field: {
        type: DataTypes.ENUM('amount', 'converted_amount', 'category', 'department', 'submitter_role', 'expense_date', 'currency'),
        allowNull: true
      },
      condition_operator: {
        type: DataTypes.ENUM('greater_than', 'less_than', 'equals', 'not_equals', 'greater_equal', 'less_equal', 'in', 'not_in', 'between'),
        allowNull: true
      },
      condition_value: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      condition_value_2: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      approval_steps: {
        type: DataTypes.JSON,
        allowNull: true
      },
      percentage_required: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      specific_approver_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      auto_approve_conditions: {
        type: DataTypes.JSON,
        allowNull: true
      },
      escalation_rules: {
        type: DataTypes.JSON,
        allowNull: true
      },
      is_manager_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      skip_manager_if_higher_role: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      parallel_approval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      require_all_in_step: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      priority: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      effective_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      success_rate: {
        type: DataTypes.DECIMAL(5, 2),
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
      { fields: ['company_id', 'is_active'], options: { name: 'approval_rules_company_id_is_active' } },
      { fields: ['rule_type', 'is_active'], options: { name: 'approval_rules_rule_type_is_active' } },
      { fields: ['priority', 'is_active'], options: { name: 'approval_rules_priority_is_active' } },
      { fields: ['condition_field', 'condition_operator'], options: { name: 'approval_rules_condition_field_operator' } },
      { fields: ['specific_approver_id'], options: { name: 'approval_rules_specific_approver_id' } },
      { fields: ['effective_date', 'expiry_date'], options: { name: 'approval_rules_effective_expiry_date' } },
      { fields: ['created_by'], options: { name: 'approval_rules_created_by' } }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('approval_rules', index.fields, index.options);
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          throw error;
        }
        console.log(`Index ${index.options.name} already exists, skipping...`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('approval_rules');
  }
};