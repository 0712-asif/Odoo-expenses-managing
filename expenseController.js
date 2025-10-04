const { Expense, User, Company, ApprovalFlow, ApprovalRule } = require('../models');
const { Op } = require('sequelize');
const { currencyService } = require('../utils/currencyService');

const expenseController = {
  async createExpense(req, res) {
    try {
      const {
        title,
        description,
        amount,
        currency,
        category,
        expense_date,
        receipt_filename,
        receipt_url
      } = req.body;

      // Validate required fields
      if (!title || !amount || !category || !expense_date) {
        return res.status(400).json({
          message: 'Title, amount, category, and expense date are required'
        });
      }

      // Get company currency for conversion
      const company = await Company.findByPk(req.user.company_id);
      const userCurrency = currency || company.currency_code;

      // Convert currency if needed
      let convertedAmount = parseFloat(amount);
      let exchangeRate = 1;

      if (userCurrency !== company.currency_code) {
        try {
          exchangeRate = await currencyService.convertCurrency(
            1, userCurrency, company.currency_code
          );
          convertedAmount = parseFloat(amount) * exchangeRate;
        } catch (error) {
          console.warn('Currency conversion failed, using 1:1 rate');
        }
      }

      // Create expense
      const expense = await Expense.create({
        title,
        description,
        amount: parseFloat(amount),
        currency: userCurrency,
        converted_amount: convertedAmount,
        exchange_rate: exchangeRate,
        category,
        expense_date,
        submitted_by: req.user.id,
        company_id: req.user.company_id,
        status: 'Submitted',
        receipt_filename,
        receipt_url,
        submitted_date: new Date(),
        approval_step: 1
      });

      // Initialize approval workflow
      await expenseController.initializeApprovalWorkflow(expense, req.user);

      // Load expense with relations
      const createdExpense = await Expense.findByPk(expense.id, {
        include: [
          {
            model: User,
            as: 'submitter',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.status(201).json({
        message: 'Expense created successfully',
        expense: createdExpense
      });

    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async initializeApprovalWorkflow(expense, submitter) {
    try {
      // Get applicable approval rules
      const rules = await ApprovalRule.findAll({
        where: {
          company_id: submitter.company_id,
          is_active: true
        },
        order: [['priority', 'ASC']]
      });

      let applicableRule = null;

      // Find matching rule
      for (const rule of rules) {
        if (expenseController.matchesRule(expense, rule, submitter)) {
          applicableRule = rule;
          break;
        }
      }

      // If no specific rule, use default manager approval
      if (!applicableRule) {
        await expenseController.createDefaultApprovalFlow(expense, submitter);
        return;
      }

      // Create approval flow based on rule
      await expenseController.createRuleBasedApprovalFlow(expense, applicableRule, submitter);

    } catch (error) {
      console.error('Initialize approval workflow error:', error);
      throw error;
    }
  },

  matchesRule(expense, rule, submitter) {
    if (!rule.condition_field) return true;

    const { condition_field, condition_operator, condition_value } = rule;

    switch (condition_field) {
      case 'amount':
        const amount = expense.converted_amount;
        const threshold = parseFloat(condition_value);

        switch (condition_operator) {
          case 'greater_than': return amount > threshold;
          case 'less_than': return amount < threshold;
          case 'greater_equal': return amount >= threshold;
          case 'less_equal': return amount <= threshold;
          case 'equals': return amount === threshold;
          default: return false;
        }

      case 'category':
        return condition_operator === 'equals' 
          ? expense.category === condition_value
          : expense.category !== condition_value;

      case 'department':
        return condition_operator === 'equals'
          ? submitter.department === condition_value
          : submitter.department !== condition_value;

      default:
        return true;
    }
  },

  async createDefaultApprovalFlow(expense, submitter) {
    const approvalSteps = [];

    // Step 1: Manager approval (if user has manager)
    if (submitter.manager_id) {
      approvalSteps.push({
        expense_id: expense.id,
        approver_id: submitter.manager_id,
        approval_step: 1,
        approver_type: 'Manager',
        status: 'Pending',
        is_required: true
      });
    }

    // Step 2: Admin approval for high amounts
    if (expense.converted_amount > 1000) {
      const admin = await User.findOne({
        where: { 
          company_id: submitter.company_id,
          role: 'Admin',
          is_active: true
        }
      });

      if (admin) {
        approvalSteps.push({
          expense_id: expense.id,
          approver_id: admin.id,
          approval_step: submitter.manager_id ? 2 : 1,
          approver_type: 'Admin',
          status: 'Pending',
          is_required: true
        });
      }
    }

    if (approvalSteps.length > 0) {
      await ApprovalFlow.bulkCreate(approvalSteps);

      // Set current approver to first step
      await expense.update({
        current_approver_id: approvalSteps[0].approver_id,
        total_approvers: approvalSteps.length,
        status: 'Under Review'
      });
    } else {
      // Auto-approve if no approvers needed
      await expense.update({
        status: 'Approved',
        approved_date: new Date()
      });
    }
  },

  async createRuleBasedApprovalFlow(expense, rule, submitter) {
    const approvalSteps = [];
    let stepNumber = 1;

    // Add manager approval if required
    if (rule.is_manager_required && submitter.manager_id) {
      approvalSteps.push({
        expense_id: expense.id,
        approver_id: submitter.manager_id,
        approval_step: stepNumber++,
        approver_type: 'Manager',
        status: 'Pending',
        is_required: true
      });
    }

    // Add rule-defined approval steps
    if (rule.approval_steps && Array.isArray(rule.approval_steps)) {
      for (const step of rule.approval_steps) {
        // Find approvers based on step definition
        const approvers = await expenseController.findApprovers(step, submitter.company_id);

        for (const approver of approvers) {
          approvalSteps.push({
            expense_id: expense.id,
            approver_id: approver.id,
            approval_step: stepNumber,
            approver_type: step.type || 'Admin',
            status: 'Pending',
            is_required: !rule.parallel_approval || step.required !== false
          });
        }

        if (!rule.parallel_approval) {
          stepNumber++;
        }
      }
    }

    if (approvalSteps.length > 0) {
      await ApprovalFlow.bulkCreate(approvalSteps);

      await expense.update({
        current_approver_id: approvalSteps[0].approver_id,
        total_approvers: approvalSteps.length,
        status: 'Under Review'
      });
    }
  },

  async findApprovers(stepDefinition, companyId) {
    const where = { 
      company_id: companyId,
      is_active: true
    };

    if (stepDefinition.role) {
      where.role = stepDefinition.role;
    }
    if (stepDefinition.department) {
      where.department = stepDefinition.department;
    }
    if (stepDefinition.user_id) {
      where.id = stepDefinition.user_id;
    }

    return await User.findAll({ where });
  },

  async approveExpense(req, res) {
    try {
      const { expenseId } = req.params;
      const { comments } = req.body;

      // Find expense with approval flow
      const expense = await Expense.findByPk(expenseId, {
        include: [{
          model: ApprovalFlow,
          as: 'approvalFlows',
          where: { 
            approver_id: req.user.id,
            status: 'Pending'
          }
        }]
      });

      if (!expense || expense.approvalFlows.length === 0) {
        return res.status(404).json({
          message: 'No pending approval found for this expense'
        });
      }

      const approvalFlow = expense.approvalFlows[0];

      // Update approval flow
      await approvalFlow.update({
        status: 'Approved',
        action_date: new Date(),
        comments
      });

      // Update expense approval count
      await expense.update({
        approved_count: expense.approved_count + 1
      });

      // Check if expense should move to next step or be fully approved
      await expenseController.processApprovalStep(expense);

      res.json({
        message: 'Expense approved successfully'
      });

    } catch (error) {
      console.error('Approve expense error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async rejectExpense(req, res) {
    try {
      const { expenseId } = req.params;
      const { comments } = req.body;

      const expense = await Expense.findByPk(expenseId, {
        include: [{
          model: ApprovalFlow,
          as: 'approvalFlows',
          where: { 
            approver_id: req.user.id,
            status: 'Pending'
          }
        }]
      });

      if (!expense || expense.approvalFlows.length === 0) {
        return res.status(404).json({
          message: 'No pending approval found for this expense'
        });
      }

      const approvalFlow = expense.approvalFlows[0];

      // Update approval flow
      await approvalFlow.update({
        status: 'Rejected',
        action_date: new Date(),
        comments
      });

      // Reject entire expense
      await expense.update({
        status: 'Rejected',
        rejection_reason: comments,
        current_approver_id: null
      });

      res.json({
        message: 'Expense rejected successfully'
      });

    } catch (error) {
      console.error('Reject expense error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async processApprovalStep(expense) {
    // Get all approval flows for this expense
    const allFlows = await ApprovalFlow.findAll({
      where: { expense_id: expense.id },
      order: [['approval_step', 'ASC']]
    });

    const currentStep = expense.approval_step;
    const currentStepFlows = allFlows.filter(f => f.approval_step === currentStep);
    const approvedInCurrentStep = currentStepFlows.filter(f => f.status === 'Approved');
    const pendingInCurrentStep = currentStepFlows.filter(f => f.status === 'Pending');

    // Check if current step is complete
    const stepComplete = pendingInCurrentStep.length === 0;

    if (stepComplete) {
      // Check if there are more steps
      const nextStep = currentStep + 1;
      const nextStepFlows = allFlows.filter(f => f.approval_step === nextStep);

      if (nextStepFlows.length > 0) {
        // Move to next step
        await expense.update({
          approval_step: nextStep,
          current_approver_id: nextStepFlows[0].approver_id
        });
      } else {
        // No more steps - check approval rules
        const approved = await expenseController.checkFinalApproval(expense, allFlows);

        await expense.update({
          status: approved ? 'Approved' : 'Rejected',
          approved_date: approved ? new Date() : null,
          current_approver_id: null
        });
      }
    }
  },

  async checkFinalApproval(expense, allFlows) {
    // Simple logic: all required approvals must be approved
    const requiredFlows = allFlows.filter(f => f.is_required);
    const approvedRequired = requiredFlows.filter(f => f.status === 'Approved');

    return approvedRequired.length === requiredFlows.length;
  },

  async getExpenses(req, res) {
    try {
      const { page = 1, limit = 10, status, category, submitter_id } = req.query;
      const offset = (page - 1) * limit;

      let where = { company_id: req.user.company_id };

      // Role-based filtering
      if (req.user.role === 'Employee') {
        where.submitted_by = req.user.id;
      }

      // Apply filters
      if (status) where.status = status;
      if (category) where.category = category;
      if (submitter_id && req.user.role !== 'Employee') {
        where.submitted_by = submitter_id;
      }

      const { count, rows: expenses } = await Expense.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'submitter',
          attributes: ['id', 'name', 'email', 'department']
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        expenses,
        pagination: {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  async getPendingApprovals(req, res) {
    try {
      // Only managers and admins can view pending approvals
      if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      const pendingFlows = await ApprovalFlow.findAll({
        where: {
          approver_id: req.user.id,
          status: 'Pending',
          is_active: true
        },
        include: [{
          model: Expense,
          as: 'expense',
          include: [{
            model: User,
            as: 'submitter',
            attributes: ['id', 'name', 'email', 'department']
          }]
        }],
        order: [['created_at', 'ASC']]
      });

      const expenses = pendingFlows.map(flow => flow.expense);

      res.json({ approvals: expenses });

    } catch (error) {
      console.error('Get pending approvals error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = expenseController;