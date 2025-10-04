const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0.01,
      max: 999999.99
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
    validate: {
      len: [3, 3],
      isUppercase: true
    }
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
    defaultValue: DataTypes.NOW
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
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'expenses',
  hooks: {
    beforeCreate: async (expense) => {
      if (!expense.expense_reference) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = await Expense.count({ 
          where: { company_id: expense.company_id }
        });
        expense.expense_reference = `EXP${year}${month}${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

module.exports = Expense;