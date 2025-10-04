const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApprovalFlow = sequelize.define('ApprovalFlow', {
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
  }
}, {
  tableName: 'approval_flows'
});

module.exports = ApprovalFlow;