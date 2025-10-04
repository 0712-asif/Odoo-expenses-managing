const { sequelize } = require('../config/config');

// Import all models
const Company = require('./Company');
const User = require('./User');
const Expense = require('./Expense');
const ApprovalFlow = require('./ApprovalFlow');
const ApprovalRule = require('./ApprovalRule');

// Define model associations

// Company associations
Company.hasMany(User, { 
  foreignKey: 'company_id', 
  as: 'employees',
  onDelete: 'CASCADE'
});

Company.belongsTo(User, { 
  foreignKey: 'admin_id', 
  as: 'admin'
});

Company.hasMany(Expense, { 
  foreignKey: 'company_id', 
  as: 'expenses',
  onDelete: 'CASCADE'
});

Company.hasMany(ApprovalRule, { 
  foreignKey: 'company_id', 
  as: 'approvalRules',
  onDelete: 'CASCADE'
});

// User associations
User.belongsTo(Company, { 
  foreignKey: 'company_id', 
  as: 'company'
});

User.belongsTo(User, { 
  foreignKey: 'manager_id', 
  as: 'manager'
});

User.hasMany(User, { 
  foreignKey: 'manager_id', 
  as: 'subordinates'
});

User.hasMany(Expense, { 
  foreignKey: 'submitted_by', 
  as: 'submittedExpenses',
  onDelete: 'CASCADE'
});

User.hasMany(Expense, { 
  foreignKey: 'current_approver_id', 
  as: 'pendingApprovals'
});

User.hasMany(ApprovalFlow, { 
  foreignKey: 'approver_id', 
  as: 'approvals',
  onDelete: 'CASCADE'
});

User.hasMany(ApprovalFlow, { 
  foreignKey: 'delegated_to', 
  as: 'delegatedApprovals'
});

User.hasMany(ApprovalRule, { 
  foreignKey: 'specific_approver_id', 
  as: 'specificApprovalRules'
});

User.hasMany(ApprovalRule, { 
  foreignKey: 'created_by', 
  as: 'createdRules'
});

// Expense associations
Expense.belongsTo(User, { 
  foreignKey: 'submitted_by', 
  as: 'submitter'
});

Expense.belongsTo(Company, { 
  foreignKey: 'company_id', 
  as: 'company'
});

Expense.belongsTo(User, { 
  foreignKey: 'current_approver_id', 
  as: 'currentApprover'
});

Expense.hasMany(ApprovalFlow, { 
  foreignKey: 'expense_id', 
  as: 'approvalFlows',
  onDelete: 'CASCADE'
});

// ApprovalFlow associations
ApprovalFlow.belongsTo(Expense, { 
  foreignKey: 'expense_id', 
  as: 'expense'
});

ApprovalFlow.belongsTo(User, { 
  foreignKey: 'approver_id', 
  as: 'approver'
});

ApprovalFlow.belongsTo(User, { 
  foreignKey: 'delegated_to', 
  as: 'delegatedApprover'
});

// ApprovalRule associations
ApprovalRule.belongsTo(Company, { 
  foreignKey: 'company_id', 
  as: 'company'
});

ApprovalRule.belongsTo(User, { 
  foreignKey: 'specific_approver_id', 
  as: 'specificApprover'
});

ApprovalRule.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'creator'
});

ApprovalRule.belongsTo(User, { 
  foreignKey: 'updated_by', 
  as: 'updater'
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  Company,
  User,
  Expense,
  ApprovalFlow,
  ApprovalRule
};