const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApprovalRule = sequelize.define('ApprovalRule', {
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
  approval_steps: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  percentage_required: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'approval_rules'
});

module.exports = ApprovalRule;