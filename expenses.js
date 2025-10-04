const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const { authorize, checkOwnership } = require('../middleware/rbac');
const { validate, schemas } = require('../middleware/validation');

// Expense CRUD routes
router.post('/', 
  auth, 
  validate(schemas.createExpense), 
  expenseController.createExpense
);

router.get('/', 
  auth, 
  expenseController.getExpenses
);

router.get('/my-expenses', 
  auth, 
  expenseController.getMyExpenses
);

router.get('/:id', 
  auth, 
  checkOwnership('submitted_by'),
  expenseController.getExpenseById
);

router.put('/:id', 
  auth, 
  checkOwnership('submitted_by'),
  validate(schemas.updateExpense),
  expenseController.updateExpense
);

router.delete('/:id', 
  auth, 
  checkOwnership('submitted_by'),
  expenseController.deleteExpense
);

// Approval routes
router.get('/pending-approvals', 
  auth, 
  authorize('Admin', 'Manager'), 
  expenseController.getPendingApprovals
);

router.put('/:expenseId/approve', 
  auth, 
  authorize('Admin', 'Manager'),
  validate(schemas.approvalAction),
  expenseController.approveExpense
);

router.put('/:expenseId/reject', 
  auth, 
  authorize('Admin', 'Manager'),
  validate(schemas.approvalAction),
  expenseController.rejectExpense
);

// Bulk operations (Admin only)
router.post('/bulk-approve', 
  auth, 
  authorize('Admin'),
  expenseController.bulkApprove
);

router.post('/bulk-reject', 
  auth, 
  authorize('Admin'),
  expenseController.bulkReject
);

// Analytics routes
router.get('/analytics/summary', 
  auth, 
  authorize('Admin', 'Manager'),
  expenseController.getAnalyticsSummary
);

router.get('/analytics/trends', 
  auth, 
  authorize('Admin', 'Manager'),
  expenseController.getExpenseTrends
);

module.exports = router;