const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate, schemas } = require('../middleware/validation');

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);

// Protected routes
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);

// Admin-only routes for user management
router.post('/users', 
  auth, 
  authorize('Admin'), 
  validate(schemas.createUser), 
  authController.createEmployee
);

router.put('/users/:userId/role', 
  auth, 
  authorize('Admin'), 
  validate(schemas.updateUser), 
  authController.updateUserRole
);

router.get('/users', 
  auth, 
  authorize('Admin', 'Manager'), 
  authController.getCompanyUsers
);

module.exports = router;