# ðŸš€ Advanced Expense Management System

A comprehensive, enterprise-grade expense management system with advanced approval workflows, role-based access control, and multi-currency support.

## âœ¨ Features

### ðŸ” Authentication & User Management
- **Complete login/signup system** with company setup
- **Role-based access control**: Admin, Manager, Employee
- **Admin user creation** - Create employees and managers
- **Dynamic role assignment** - Change roles: Employee â†” Manager â†” Admin
- **Manager relationship management** - Define organizational hierarchy

### ðŸ’° Advanced Expense Management
- **Multi-currency support** - Submit expenses in different currencies from company currency
- **Automatic currency conversion** with real-time exchange rates
- **Comprehensive expense tracking** - Amount, Category, Description, Date, Receipts
- **Expense history** with detailed status tracking (Approved, Rejected, Under Review)
- **Receipt upload** with OCR text extraction

### ðŸ”„ Sophisticated Approval Workflows
- **Multi-level sequential approval** - Step 1 â†’ Manager â†’ Step 2 â†’ Finance â†’ Step 3 â†’ Director
- **Conditional approval rules**:
  - **Percentage rules**: "If 60% of approvers approve â†’ Expense approved"
  - **Specific approver rules**: "If CFO approves â†’ Expense auto-approved"
  - **Hybrid rules**: Combine both (e.g., 60% OR CFO approves)
- **Manager approval interface** with approve/reject + comments
- **Real-time approval tracking** through entire workflow
- **Automatic escalation** and reminder system

### ðŸ“Š Enterprise Administration
- **Advanced admin dashboard** with metrics and analytics
- **User management interface** - Create, edit, manage employees
- **Approval rules configuration** - Set up complex conditional workflows
- **Company settings** - Policies, budgets, currency settings
- **Comprehensive reporting** and analytics

### ðŸŽ¨ Professional UI/UX
- **Material-UI design system** throughout
- **Responsive design** for all devices (mobile, tablet, desktop)
- **Role-based navigation** menus
- **Toast notifications** for user feedback
- **Dark/light theme support**
- **Professional data tables** with sorting, filtering, pagination

## ðŸ—ï¸ System Architecture

### Backend (Node.js/Express)
```
backend/
â”œâ”€â”€ models/          # Sequelize ORM models with relationships
â”œâ”€â”€ controllers/     # Business logic and API endpoints
â”œâ”€â”€ routes/          # Express route definitions
â”œâ”€â”€ middleware/      # Authentication, RBAC, validation
â”œâ”€â”€ utils/           # Currency service, approval engine, helpers
â””â”€â”€ config/          # Database, JWT, CORS configuration
```

### Frontend (React 18)
```
frontend/src/
â”œâ”€â”€ pages/           # Main application pages
â”œâ”€â”€ components/      # Reusable UI components
â”œâ”€â”€ context/         # React Context (Auth, Theme, Notifications)
â”œâ”€â”€ services/        # API calls and HTTP client
â”œâ”€â”€ hooks/           # Custom React hooks
â””â”€â”€ utils/           # Formatters, validators, constants
```

### Database (MySQL)
- **Companies** - Multi-tenant company management
- **Users** - Enhanced user model with roles and relationships
- **Expenses** - Multi-currency expense tracking
- **ApprovalFlows** - Sequential approval workflow tracking
- **ApprovalRules** - Conditional approval rule engine

## ðŸš€ Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd expense-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install

   # Configure environment
   cp .env.example .env
   # Edit .env with your database credentials

   # Setup database
   npm run migrate    # Create tables
   npm run seed       # Add sample data

   # Start development server
   npm run dev        # Runs on port 5000
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install

   # Configure environment
   cp .env.example .env
   # Edit .env with API URL (http://localhost:5000/api)

   # Start development server
   npm start          # Runs on port 3000
   ```

4. **Access the Application**
   - ðŸŒ **Frontend**: http://localhost:3000
   - ðŸ”Œ **Backend API**: http://localhost:5000/api
   - ðŸ¥ **Health Check**: http://localhost:5000/api/health

### Demo Credentials

| Role | Email | Password | Access Level |
|------|--------|----------|--------------|
| **Admin** | admin@democompany.com | admin123 | Full system access |
| **Manager** | manager@democompany.com | manager123 | Approve expenses & manage team |
| **Employee** | employee@democompany.com | employee123 | Submit & track expenses |

## ðŸ“± Usage Guide

### For Employees
1. **Login** with employee credentials
2. **Submit expenses** - Fill form with amount, category, description, date
3. **Upload receipts** - Drag & drop or click to upload
4. **Track approval status** - Real-time updates on approval progress
5. **View expense history** - Filter by status, date, category

### For Managers
1. **Review pending approvals** - Dashboard shows expenses waiting for approval
2. **Approve/reject expenses** - Add comments and take action
3. **View team expenses** - Monitor team spending patterns
4. **Access reports** - Expense analytics and trends

### For Admins
1. **Create users** - Add employees and managers to the system
2. **Assign roles** - Change user roles and manager relationships
3. **Configure approval rules** - Set up complex conditional workflows
4. **Manage company settings** - Policies, budgets, currency settings
5. **Access all features** - Full system administration

## ðŸ”§ Configuration

### Approval Rules Examples

**Amount-based Rule:**
```json
{
  "name": "High-value expenses require admin approval",
  "rule_type": "Amount",
  "condition_field": "converted_amount",
  "condition_operator": "greater_than",
  "condition_value": "1000",
  "approval_steps": [
    {"type": "Manager", "required": true},
    {"type": "Admin", "required": true}
  ]
}
```

**Percentage-based Rule:**
```json
{
  "name": "60% approval required",
  "rule_type": "Percentage",
  "percentage_required": 60,
  "approval_steps": [
    {"type": "Manager", "required": false},
    {"type": "Finance", "required": false},
    {"type": "Director", "required": false}
  ]
}
```

**CFO Auto-approval Rule:**
```json
{
  "name": "CFO auto-approval",
  "rule_type": "Specific_Approver",
  "specific_approver_id": 1,
  "auto_approve_conditions": {
    "cfo_approval": true
  }
}
```

## ðŸš¢ Production Deployment

### Using Docker
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment
1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy built files** to your web server (Nginx, Apache)

3. **Configure reverse proxy** for API routing

4. **Set environment variables** for production

5. **Run database migrations** on production database

## ðŸ§ª Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run all tests
npm run test:all
```

## ðŸ“Š Technology Stack

| Category | Technologies |
|----------|-------------|
| **Backend** | Node.js, Express.js, Sequelize ORM, JWT, Multer |
| **Frontend** | React 18, Material-UI, React Router, Axios, React Query |
| **Database** | MySQL, Database migrations, Indexing |
| **DevOps** | Docker, Nginx, Environment-based config |

## ðŸ¤ Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ðŸ“„ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ðŸ†˜ Support

- ðŸ“§ **Email**: support@expensemanager.com
- ðŸ“– **Documentation**: Check `/docs` folder for detailed guides
- ðŸ› **Issues**: Report bugs via GitHub Issues
- ðŸ’¬ **Discussions**: Join our community discussions

## ðŸŽ‰ Acknowledgments

- Material-UI team for the excellent design system
- React team for the robust frontend framework
- Express.js community for the backend framework
- All contributors who helped build this system

---

**Built with â¤ï¸ for modern expense management**