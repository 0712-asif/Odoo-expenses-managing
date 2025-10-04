const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  currency_code: {
    type: DataTypes.STRING(3),
    allowNull: false,
    validate: {
      len: [3, 3],
      isUppercase: true
    },
    set(value) {
      this.setDataValue('currency_code', value.toUpperCase());
    }
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
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  expense_policy: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      max_expense_amount: 10000,
      require_receipt_over: 25,
      auto_approve_under: 0,
      allowed_categories: ['Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Other'],
      approval_required_over: 100
    }
  },
  approval_settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      default_manager_approval: true,
      parallel_approvals: false,
      auto_escalation_days: 7,
      reminder_frequency_days: 2
    }
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
    allowNull: true,
    validate: {
      isUrl: true
    }
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
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'companies',
  indexes: [
    { fields: ['admin_id'] },
    { fields: ['country'] },
    { fields: ['currency_code'] },
    { fields: ['is_active'] }
  ]
});

module.exports = Company;