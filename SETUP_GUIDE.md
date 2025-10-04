# ðŸš€ Database Setup Guide

## The Problem
The database has partial tables that don't match the migration files. This happens when Sequelize models create tables directly instead of through migrations.

## âœ… Easy Solution

### Step 1: Configure Database
1. Copy `.env.example` to `.env`
2. Update your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306  
   DB_NAME=expense_management
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   ```

### Step 2: One Command Setup
```bash
npm run full-setup
```
This will:
- ðŸ—‘ï¸ Drop the entire database
- ðŸ†• Create a fresh database  
- ðŸ“‹ Run all migrations
- ðŸŒ± Seed with demo data

### Step 3: Start the Server
```bash
npm run dev
```

## ðŸŽ¯ Demo Credentials
- **Admin**: admin@democompany.com / admin123
- **Manager**: manager@democompany.com / manager123  
- **Employee**: employee@democompany.com / employee123

## ðŸ› ï¸ Manual Setup (If Needed)
If the one-command setup doesn't work:

```bash
# 1. Clean reset
npm run clean-reset

# 2. Run migrations  
npm run migrate

# 3. Seed data
npm run seed

# 4. Start server
npm run dev
```

## âŒ Troubleshooting

### "Access Denied" Error
- Check your MySQL username/password in .env
- Make sure MySQL server is running
- Try connecting with MySQL client first

### "Database doesn't exist" Error  
- The clean-reset script will create it
- Or manually create: `CREATE DATABASE expense_management;`

### Migration Errors
- Run `npm run clean-reset` first
- This drops everything and starts fresh

## ðŸŽ‰ Success Indicators
When setup is successful, you'll see:
- âœ… Database created successfully
- âœ… All 5 migrations completed
- âœ… Demo data seeded (4 users, sample expenses, approval rules)
- ðŸš€ Server running on port 5000

Then you can start the frontend and test the full system!