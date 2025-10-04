const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const workingSeed = async () => {
  try {
    console.log('ðŸŒ± Starting working database seeding...');

    // Test connection
    await sequelize.authenticate();
    console.log('âœ… Database connection successful');

    // Create demo company
    const [companyResult] = await sequelize.query(`
      INSERT INTO companies (name, country, currency_code, currency_name, currency_symbol, 
                           expense_policy, approval_settings, address, phone, email, website, 
                           is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [
        'Demo Company Inc.',
        'United States', 
        'USD',
        'US Dollar',
        '$',
        JSON.stringify({
          max_expense_amount: 10000,
          require_receipt_over: 25,
          auto_approve_under: 0,
          allowed_categories: ['Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Other'],
          approval_required_over: 100
        }),
        JSON.stringify({
          default_manager_approval: true,
          parallel_approvals: false,
          auto_escalation_days: 7,
          reminder_frequency_days: 2
        }),
        '123 Business St, New York, NY 10001',
        '+1-555-0199',
        'info@democompany.com',
        'https://democompany.com',
        true
      ]
    });

    console.log('âœ… Demo company created');

    // Create demo users with hashed passwords
    const saltRounds = 10;

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, company_id, department, 
                        employee_code, phone, designation, date_joined, is_active,
                        notification_preferences, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, NOW(), NOW())
    `, {
      replacements: [
        'Admin User',
        'admin@democompany.com',
        adminPassword,
        'Admin',
        1,
        'Administration',
        'ADM001',
        '+1-555-0101',
        'System Administrator',
        true,
        JSON.stringify({
          email_notifications: true,
          expense_updates: true,
          approval_requests: true,
          system_updates: true
        })
      ]
    });

    // Get admin ID and update company
    const [adminResults] = await sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      { replacements: ['admin@democompany.com'] }
    );
    const adminId = adminResults[0].id;

    await sequelize.query(
      'UPDATE companies SET admin_id = ? WHERE id = ?',
      { replacements: [adminId, 1] }
    );

    // Create manager user - FIXED COLUMN ORDER
    const managerPassword = await bcrypt.hash('manager123', saltRounds);
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, company_id, manager_id, department,
                        employee_code, phone, designation, date_joined, is_active,
                        notification_preferences, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, NOW(), NOW())
    `, {
      replacements: [
        'Manager Smith',
        'manager@democompany.com',
        managerPassword,
        'Manager',
        1,
        adminId,
        'Operations',
        'MGR001',
        '+1-555-0102',
        'Operations Manager',  // This was in wrong position before!
        true,
        JSON.stringify({
          email_notifications: true,
          expense_updates: true,
          approval_requests: true,
          system_updates: false
        })
      ]
    });

    // Get manager ID
    const [managerResults] = await sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      { replacements: ['manager@democompany.com'] }
    );
    const managerId = managerResults[0].id;

    // Create employee users
    const employeePassword = await bcrypt.hash('employee123', saltRounds);

    await sequelize.query(`
      INSERT INTO users (name, email, password, role, company_id, manager_id, department,
                        employee_code, phone, designation, date_joined, is_active,
                        notification_preferences, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, NOW(), NOW())
    `, {
      replacements: [
        'John Doe',
        'employee@democompany.com',
        employeePassword,
        'Employee',
        1,
        managerId,
        'Sales',
        'EMP001',
        '+1-555-0103',
        'Sales Executive',
        true,
        JSON.stringify({
          email_notifications: true,
          expense_updates: true,
          approval_requests: true,
          system_updates: false
        })
      ]
    });

    await sequelize.query(`
      INSERT INTO users (name, email, password, role, company_id, manager_id, department,
                        employee_code, phone, designation, date_joined, is_active,
                        notification_preferences, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, NOW(), NOW())
    `, {
      replacements: [
        'Jane Smith',
        'jane@democompany.com',
        employeePassword,
        'Employee',
        1,
        managerId,
        'Marketing',
        'EMP002',
        '+1-555-0104',
        'Marketing Specialist',
        true,
        JSON.stringify({
          email_notifications: true,
          expense_updates: true,
          approval_requests: true,
          system_updates: false
        })
      ]
    });

    console.log('âœ… Demo users created (Admin, Manager, 2 Employees)');

    // Get employee IDs for sample expenses
    const [employeeResults] = await sequelize.query(
      'SELECT id FROM users WHERE email IN (?, ?)',
      { replacements: ['employee@democompany.com', 'jane@democompany.com'] }
    );
    const employeeId1 = employeeResults[0].id;
    const employeeId2 = employeeResults[1].id;

    // Create sample expenses
    await sequelize.query(`
      INSERT INTO expenses (title, description, amount, currency, converted_amount, exchange_rate,
                           category, expense_date, submitted_by, company_id, status, 
                           current_approver_id, approval_step, submitted_date, expense_reference,
                           tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, NOW(), NOW())
    `, {
      replacements: [
        'Business Lunch with Client',
        'Lunch meeting with potential client to discuss new project requirements',
        85.50,
        'USD',
        85.50,
        1.0,
        'Meals',
        '2025-01-15',
        employeeId1,
        1,
        'Approved',
        null,
        0,
        'EXP202501001',
        JSON.stringify(['client', 'business'])
      ]
    });

    await sequelize.query(`
      INSERT INTO expenses (title, description, amount, currency, converted_amount, exchange_rate,
                           category, expense_date, submitted_by, company_id, status,
                           current_approver_id, approval_step, submitted_date, expense_reference,
                           tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, NOW(), NOW())
    `, {
      replacements: [
        'Office Supplies - Stationery',
        'Purchased notebooks, pens, and sticky notes for the team',
        45.25,
        'USD',
        45.25,
        1.0,
        'Office Supplies',
        '2025-01-18',
        employeeId2,
        1,
        'Under Review',
        managerId,
        1,
        'EXP202501002',
        JSON.stringify(['office', 'supplies'])
      ]
    });

    console.log('âœ… Sample expenses created');
    console.log('\nðŸŽ‰ Database seeding completed successfully!');
    console.log('\nðŸ“‹ DEMO CREDENTIALS:');
    console.log('   ðŸ‘¤ Admin: admin@democompany.com / admin123');
    console.log('   ðŸ‘¨â€ðŸ’¼ Manager: manager@democompany.com / manager123');
    console.log('   ðŸ‘©â€ðŸ’» Employee: employee@democompany.com / employee123');
    console.log('   ðŸ‘©â€ðŸ’» Employee 2: jane@democompany.com / employee123');
    console.log('\nðŸ¢ Company: Demo Company Inc. (USD currency)');
    console.log('ðŸ“Š Sample data: 2 expenses, 4 users ready to test!');
    console.log('\nðŸš€ Next: npm run dev (server will start on port 5000)');

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
  workingSeed();
}

module.exports = workingSeed;