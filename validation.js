const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails
      });
    }

    next();
  };
};

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    companyName: Joi.string().min(2).max(255).required(),
    country: Joi.string().min(2).max(100).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createUser: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Employee', 'Manager').required(),
    department: Joi.string().min(2).max(100).optional(),
    manager_id: Joi.number().integer().positive().optional(),
    employee_code: Joi.string().max(50).optional(),
    phone: Joi.string().min(10).max(20).optional(),
    designation: Joi.string().max(100).optional()
  }),

  updateUser: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    role: Joi.string().valid('Employee', 'Manager', 'Admin').optional(),
    department: Joi.string().min(2).max(100).optional(),
    manager_id: Joi.number().integer().positive().allow(null).optional(),
    phone: Joi.string().min(10).max(20).allow(null).optional(),
    designation: Joi.string().max(100).allow(null).optional()
  }),

  createExpense: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).optional(),
    amount: Joi.number().positive().precision(2).required(),
    currency: Joi.string().length(3).uppercase().required(),
    category: Joi.string().valid('Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Marketing', 'Training', 'Entertainment', 'Other').required(),
    expense_date: Joi.date().max('now').required(),
    receipt_filename: Joi.string().max(255).optional(),
    receipt_url: Joi.string().uri().max(500).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
  }),

  updateExpense: Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    amount: Joi.number().positive().precision(2).optional(),
    currency: Joi.string().length(3).uppercase().optional(),
    category: Joi.string().valid('Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Marketing', 'Training', 'Entertainment', 'Other').optional(),
    expense_date: Joi.date().max('now').optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
  }),

  approvalAction: Joi.object({
    comments: Joi.string().max(1000).allow('').optional()
  }),

  createApprovalRule: Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).optional(),
    rule_type: Joi.string().valid('Amount', 'Category', 'Department', 'Percentage', 'Specific_Approver', 'Hybrid', 'Role_Based', 'Time_Based').required(),
    condition_field: Joi.string().valid('amount', 'converted_amount', 'category', 'department', 'submitter_role', 'expense_date', 'currency').optional(),
    condition_operator: Joi.string().valid('greater_than', 'less_than', 'equals', 'not_equals', 'greater_equal', 'less_equal', 'in', 'not_in', 'between').optional(),
    condition_value: Joi.alternatives().try(
      Joi.string(),
      Joi.number(),
      Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number()))
    ).optional(),
    condition_value_2: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
    approval_steps: Joi.array().items(Joi.object({
      type: Joi.string().valid('Manager', 'Finance', 'Admin', 'Director', 'CFO', 'CEO', 'HR', 'Department Head').required(),
      required: Joi.boolean().default(true),
      user_id: Joi.number().integer().positive().optional(),
      role: Joi.string().optional(),
      department: Joi.string().optional()
    })).min(1).required(),
    percentage_required: Joi.number().integer().min(1).max(100).optional(),
    specific_approver_id: Joi.number().integer().positive().optional(),
    is_manager_required: Joi.boolean().default(true),
    parallel_approval: Joi.boolean().default(false),
    priority: Joi.number().integer().min(1).max(100).default(1)
  })
};

module.exports = { validate, schemas };