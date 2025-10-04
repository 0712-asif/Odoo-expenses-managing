const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Manager', 'Employee'),
    defaultValue: 'Employee',
    allowNull: false
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [2, 100]
    }
  },
  employee_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [10, 20]
    }
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  date_joined: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notification_preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      email_notifications: true,
      expense_updates: true,
      approval_requests: true,
      system_updates: false
    }
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
        user.password = await bcrypt.hash(user.password, salt);
      }

      // Generate employee code if not provided
      if (!user.employee_code) {
        const count = await User.count({ where: { company_id: user.company_id } });
        const prefix = user.role === 'Admin' ? 'ADM' : user.role === 'Manager' ? 'MGR' : 'EMP';
        user.employee_code = `${prefix}${String(count + 1).padStart(3, '0')}`;
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  indexes: [
    { unique: true, fields: ['email'] },
    { fields: ['company_id'] },
    { fields: ['manager_id'] },
    { fields: ['role'] },
    { unique: true, fields: ['employee_code'] },
    { fields: ['department'] },
    { fields: ['is_active'] }
  ]
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.updateLastLogin = async function() {
  this.last_login = new Date();
  await this.save();
};

module.exports = User;