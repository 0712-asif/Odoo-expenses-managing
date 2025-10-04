const { sequelize, Company, User, Expense, ApprovalRule } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('ðŸŒ± Starting database seeding...');

    // Clear existing data
    await sequelize.sync({ force: true });
    console.log('ðŸ“ Database tables created/reset');

    // Create demo company
    const demoCompany = await Company.create({
      name: 'Demo Company Inc.',
      country: 'United States',
      currency_code: 'USD',
      currency_name: 'US Dollar',
      currency_symbol: '$',
      expense_policy: {
        max_expense_amount: 10000,
        require_receipt_over: 25,
        auto_approve_under: 0,
        allowed_categories: ['Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Other'],
        approval_required_over: 100
      },
      approval_settings: {
        default_manager_approval: true,
        parallel_approvals: false,
        auto_escalation_days: 7,
        reminder_frequency_days: 2
      },
      address: '123 Business St, New York, NY 10001',
      phone: '+1-555-0199',
      email: 'info@democompany.com',
      website: 'https://democompany.com'
    });

    console.log('âœ… Demo company created');

    // Create demo users with hashed passwords
    const saltRounds = 10;

    // Admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@democompany.com',
      password: await bcrypt.hash('admin123', saltRounds),
      role: 'Admin',
      company_id: demoCompany.id,
      department: 'Administration',
      employee_code: 'ADM001',
      phone: '+1-555-0101',
      designation: 'System Administrator',
      date_joined: new Date()
    });

    // Manager user
    const managerUser = await User.create({
      name: 'Manager Smith',
      email: 'manager@democompany.com',
      password: await bcrypt.hash('manager123', saltRounds),
      role: 'Manager',
      company_id: demoCompany.id,
      manager_id: adminUser.id,
      department: 'Operations',
      employee_code: 'MGR001',
      phone: '+1-555-0102',
      designation: 'Operations Manager',
      date_joined: new Date()
    });

    // Employee user
    const employeeUser = await User.create({
      name: 'John Doe',
      email: 'employee@democompany.com',
      password: await bcrypt.hash('employee123', saltRounds),
      role: 'Employee',
      company_id: demoCompany.id,
      manager_id: managerUser.id,
      department: 'Sales',
      employee_code: 'EMP001',
      phone: '+1-555-0103',
      designation: 'Sales Executive',
      date_joined: new Date()
    });

    // Additional employee
    const employee2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@democompany.com',
      password: await bcrypt.hash('employee123', saltRounds),
      role: 'Employee',
      company_id: demoCompany.id,
      manager_id: managerUser.id,
      department: 'Marketing',
      employee_code: 'EMP002',
      phone: '+1-555-0104',
      designation: 'Marketing Specialist',
      date_joined: new Date()
    });

    // Update company admin
    await demoCompany.update({ admin_id: adminUser.id });

    console.log('âœ… Demo users created (Admin, Manager, 2 Employees)');

    // Create sample expenses
    const sampleExpenses = [
      {
        title: 'Business Lunch with Client',
        description: 'Lunch meeting with potential client to discuss new project requirements',
        amount: 85.50,
        currency: 'USD',
        converted_amount: 85.50,
        exchange_rate: 1.0,
        category: 'Meals',
        expense_date: new Date('2025-01-15'),
        submitted_by: employeeUser.id,
        company_id: demoCompany.id,
        status: 'Approved',
        current_approver_id: null,
        approval_step: 0,
        submitted_date: new Date('2025-01-16'),
        approved_date: new Date('2025-01-17'),
        expense_reference: 'EXP202501001'
      },
      {
        title: 'Office Supplies - Stationery',
        description: 'Purchased notebooks, pens, and sticky notes for the team',
        amount: 45.25,
        currency: 'USD',
        converted_amount: 45.25,
        exchange_rate: 1.0,
        category: 'Office Supplies',
        expense_date: new Date('2025-01-18'),
        submitted_by: employee2.id,
        company_id: demoCompany.id,
        status: 'Under Review',
        current_approver_id: managerUser.id,
        approval_step: 1,
        submitted_date: new Date('2025-01-19'),
        expense_reference: 'EXP202501002'
      },
      {
        title: 'Software License - Adobe Creative Suite',
        description: 'Annual license for Adobe Creative Suite for marketing team',
        amount: 599.99,
        currency: 'USD',
        converted_amount: 599.99,
        exchange_rate: 1.0,
        category: 'Software',
        expense_date: new Date('2025-01-20'),
        submitted_by: employee2.id,
        company_id: demoCompany.id,
        status: 'Submitted',
        current_approver_id: managerUser.id,
        approval_step: 1,
        submitted_date: new Date('2025-01-21'),
        expense_reference: 'EXP202501003'
      },
      {
        title: 'Travel - Conference in Chicago',
        description: 'Flight tickets and hotel for attending Marketing Summit 2025',
        amount: 1250.00,
        currency: 'USD',
        converted_amount: 1250.00,
        exchange_rate: 1.0,
        category: 'Travel',
        expense_date: new Date('2025-01-22'),
        submitted_by: employeeUser.id,
        company_id: demoCompany.id,
        status: 'Under Review',
        current_approver_id: adminUser.id,
        approval_step: 2,
        submitted_date: new Date('2025-01-23'),
        expense_reference: 'EXP202501004'
      }
    ];

    for (const expenseData of sampleExpenses) {
      await Expense.create(expenseData);
    }

    console.log('âœ… Sample expenses created');

    // Create sample approval rules
    const sampleRules = [
      {
        name: 'Manager Approval for Expenses > $100',
        description: 'All expenses over $100 require manager approval',
        company_id: demoCompany.id,
        rule_type: 'Amount',
        condition_field: 'converted_amount',
        condition_operator: 'greater_than',
        condition_value: '100',
        approval_steps: [
          { type: 'Manager', required: true }
        ],
        is_manager_required: true,
        parallel_approval: false,
        priority: 1,
        created_by: adminUser.id
      },
      {
        name: 'Admin Approval for High-Value Expenses > $1000',
        description: 'Expenses over $1000 require both manager and admin approval',
        company_id: demoCompany.id,
        rule_type: 'Amount',
        condition_field: 'converted_amount',
        condition_operator: 'greater_than',
        condition_value: '1000',
        approval_steps: [
          { type: 'Manager', required: true },
          { type: 'Admin', required: true }
        ],
        is_manager_required: true,
        parallel_approval: false,
        priority: 2,
        created_by: adminUser.id
      },
      {
        name: '60% Approval Required for Team Expenses',
        description: 'Team expenses require approval from 60% of available approvers',
        company_id: demoCompany.id,
        rule_type: 'Percentage',
        condition_field: 'converted_amount',
        condition_operator: 'greater_than',
        condition_value: '500',
        approval_steps: [
          { type: 'Manager', required: false },
          { type: 'Finance', required: false },
          { type: 'Admin', required: false }
        ],
        percentage_required: 60,
        is_manager_required: false,
        parallel_approval: true,
        priority: 3,
        created_by: adminUser.id
      },
      {
        name: 'CFO Auto-Approval Rule',
        description: 'If CFO approves, expense is automatically approved regardless of amount',
        company_id: demoCompany.id,
        rule_type: 'Specific_Approver',
        specific_approver_id: adminUser.id, // Using admin as CFO for demo
        approval_steps: [
          { type: 'CFO', required: true, user_id: adminUser.id }
        ],
        auto_approve_conditions: {
          cfo_approval: true
        },
        is_manager_required: false,
        parallel_approval: false,
        priority: 5,
        created_by: adminUser.id
      }
    ];

    for (const ruleData of sampleRules) {
      await ApprovalRule.create(ruleData);
    }

    console.log('âœ… Sample approval rules created');

    console.log('\nðŸŽ‰ Database seeding completed successfully!');
    console.log('\nðŸ“‹ DEMO CREDENTIALS:');
    console.log('   ðŸ‘¤ Admin: admin@democompany.com / admin123');
    console.log('   ðŸ‘¨â€ðŸ’¼ Manager: manager@democompany.com / manager123');
    console.log('   ðŸ‘©â€ðŸ’» Employee: employee@democompany.com / employee123');
    console.log('   ðŸ‘©â€ðŸ’» Employee 2: jane@democompany.com / employee123');
    console.log('\nðŸ¢ Company: Demo Company Inc. (USD currency)');
    console.log('ðŸ“Š Sample data: 4 expenses, 4 approval rules, 4 users');

  } catch (error) {
    console.error('âŒ Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;