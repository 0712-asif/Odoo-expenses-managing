const { ApprovalRule, User, ApprovalFlow } = require('../models');
const { Op } = require('sequelize');

class ApprovalEngine {
  constructor() {
    this.ruleCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getApplicableRules(expense, submitter) {
    const cacheKey = `rules_${submitter.company_id}`;

    // Check cache first
    if (this.ruleCache.has(cacheKey)) {
      const cached = this.ruleCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return this.filterApplicableRules(cached.rules, expense, submitter);
      }
    }

    // Fetch rules from database
    const rules = await ApprovalRule.findAll({
      where: {
        company_id: submitter.company_id,
        is_active: true,
        [Op.or]: [
          { effective_date: { [Op.lte]: new Date() } },
          { effective_date: null }
        ],
        [Op.or]: [
          { expiry_date: { [Op.gte]: new Date() } },
          { expiry_date: null }
        ]
      },
      order: [['priority', 'ASC']]
    });

    // Cache rules
    this.ruleCache.set(cacheKey, {
      rules,
      timestamp: Date.now()
    });

    return this.filterApplicableRules(rules, expense, submitter);
  }

  filterApplicableRules(rules, expense, submitter) {
    return rules.filter(rule => this.matchesRule(rule, expense, submitter));
  }

  matchesRule(rule, expense, submitter) {
    // If no conditions, rule applies to all
    if (!rule.condition_field) {
      return true;
    }

    const { condition_field, condition_operator, condition_value, condition_value_2 } = rule;

    let fieldValue;
    switch (condition_field) {
      case 'amount':
        fieldValue = expense.amount;
        break;
      case 'converted_amount':
        fieldValue = expense.converted_amount;
        break;
      case 'category':
        fieldValue = expense.category;
        break;
      case 'department':
        fieldValue = submitter.department;
        break;
      case 'submitter_role':
        fieldValue = submitter.role;
        break;
      case 'currency':
        fieldValue = expense.currency;
        break;
      case 'expense_date':
        fieldValue = new Date(expense.expense_date);
        break;
      default:
        return true;
    }

    return this.evaluateCondition(fieldValue, condition_operator, condition_value, condition_value_2);
  }

  evaluateCondition(fieldValue, operator, value, value2 = null) {
    // Parse value if it's JSON
    let parsedValue = value;
    try {
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        parsedValue = JSON.parse(value);
      }
    } catch (e) {
      // Keep original value if parsing fails
    }

    switch (operator) {
      case 'equals':
        return fieldValue === parsedValue;

      case 'not_equals':
        return fieldValue !== parsedValue;

      case 'greater_than':
        return parseFloat(fieldValue) > parseFloat(parsedValue);

      case 'less_than':
        return parseFloat(fieldValue) < parseFloat(parsedValue);

      case 'greater_equal':
        return parseFloat(fieldValue) >= parseFloat(parsedValue);

      case 'less_equal':
        return parseFloat(fieldValue) <= parseFloat(parsedValue);

      case 'in':
        return Array.isArray(parsedValue) ? parsedValue.includes(fieldValue) : false;

      case 'not_in':
        return Array.isArray(parsedValue) ? !parsedValue.includes(fieldValue) : true;

      case 'between':
        const numValue = parseFloat(fieldValue);
        const numMin = parseFloat(parsedValue);
        const numMax = parseFloat(value2);
        return numValue >= numMin && numValue <= numMax;

      default:
        return true;
    }
  }

  async createApprovalWorkflow(expense, submitter) {
    const applicableRules = await this.getApplicableRules(expense, submitter);

    if (applicableRules.length === 0) {
      return await this.createDefaultWorkflow(expense, submitter);
    }

    // Use the highest priority rule (lowest priority number)
    const rule = applicableRules[0];
    return await this.createRuleBasedWorkflow(expense, submitter, rule);
  }

  async createDefaultWorkflow(expense, submitter) {
    const approvalSteps = [];

    // Step 1: Manager approval (if user has manager)
    if (submitter.manager_id) {
      approvalSteps.push({
        expense_id: expense.id,
        approver_id: submitter.manager_id,
        approval_step: 1,
        approver_type: 'Manager',
        status: 'Pending',
        is_required: true,
        due_date: this.calculateDueDate(2) // 2 days
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

      if (admin && admin.id !== submitter.id) {
        approvalSteps.push({
          expense_id: expense.id,
          approver_id: admin.id,
          approval_step: submitter.manager_id ? 2 : 1,
          approver_type: 'Admin',
          status: 'Pending',
          is_required: true,
          due_date: this.calculateDueDate(3) // 3 days
        });
      }
    }

    if (approvalSteps.length > 0) {
      await ApprovalFlow.bulkCreate(approvalSteps);
      return {
        total_approvers: approvalSteps.length,
        current_step: 1,
        current_approver_id: approvalSteps[0].approver_id,
        status: 'Under Review'
      };
    }

    return {
      total_approvers: 0,
      current_step: 0,
      current_approver_id: null,
      status: 'Approved'
    };
  }

  async createRuleBasedWorkflow(expense, submitter, rule) {
    const approvalSteps = [];
    let stepNumber = 1;

    // Add manager approval if required
    if (rule.is_manager_required && submitter.manager_id) {
      // Skip manager if submitter has higher role and rule allows it
      const shouldSkipManager = rule.skip_manager_if_higher_role && 
        ['Manager', 'Admin'].includes(submitter.role);

      if (!shouldSkipManager) {
        approvalSteps.push({
          expense_id: expense.id,
          approver_id: submitter.manager_id,
          approval_step: stepNumber++,
          approver_type: 'Manager',
          status: 'Pending',
          is_required: true,
          due_date: this.calculateDueDate(2)
        });
      }
    }

    // Add rule-defined approval steps
    if (rule.approval_steps && Array.isArray(rule.approval_steps)) {
      for (const stepDef of rule.approval_steps) {
        const approvers = await this.findApprovers(stepDef, submitter.company_id, submitter.id);

        for (const approver of approvers) {
          approvalSteps.push({
            expense_id: expense.id,
            approver_id: approver.id,
            approval_step: rule.parallel_approval ? stepNumber : stepNumber,
            approver_type: stepDef.type || 'Admin',
            status: 'Pending',
            is_required: stepDef.required !== false,
            due_date: this.calculateDueDate(stepDef.days || 3)
          });
        }

        if (!rule.parallel_approval) {
          stepNumber++;
        }
      }

      if (rule.parallel_approval && rule.approval_steps.length > 0) {
        stepNumber++;
      }
    }

    // Handle special rule types
    if (rule.rule_type === 'Specific_Approver' && rule.specific_approver_id) {
      const specificApprover = await User.findByPk(rule.specific_approver_id);
      if (specificApprover && specificApprover.id !== submitter.id) {
        approvalSteps.push({
          expense_id: expense.id,
          approver_id: specificApprover.id,
          approval_step: stepNumber,
          approver_type: 'CFO', // or appropriate type
          status: 'Pending',
          is_required: true,
          auto_approved: rule.auto_approve_conditions?.cfo_approval === true,
          auto_approval_reason: 'CFO auto-approval rule',
          due_date: this.calculateDueDate(1)
        });
      }
    }

    if (approvalSteps.length > 0) {
      await ApprovalFlow.bulkCreate(approvalSteps);

      // Update rule usage statistics
      await rule.increment('usage_count');

      return {
        total_approvers: approvalSteps.length,
        current_step: 1,
        current_approver_id: approvalSteps[0].approver_id,
        status: 'Under Review',
        rule_applied: rule.id
      };
    }

    return {
      total_approvers: 0,
      current_step: 0,
      current_approver_id: null,
      status: 'Approved',
      rule_applied: rule.id
    };
  }

  async findApprovers(stepDefinition, companyId, submitterId) {
    const where = { 
      company_id: companyId,
      is_active: true,
      id: { [Op.ne]: submitterId } // Exclude submitter
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
  }

  calculateDueDate(days) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  }

  async processApprovalStep(expense, approvalFlow) {
    const allFlows = await ApprovalFlow.findAll({
      where: { expense_id: expense.id },
      order: [['approval_step', 'ASC']]
    });

    const currentStep = expense.approval_step;
    const currentStepFlows = allFlows.filter(f => f.approval_step === currentStep);
    const pendingInCurrentStep = currentStepFlows.filter(f => f.status === 'Pending');

    // Check if current step is complete
    const isStepComplete = pendingInCurrentStep.length === 0;

    if (isStepComplete) {
      return await this.moveToNextStep(expense, allFlows);
    }

    return { moved: false, status: expense.status };
  }

  async moveToNextStep(expense, allFlows) {
    const nextStep = expense.approval_step + 1;
    const nextStepFlows = allFlows.filter(f => f.approval_step === nextStep);

    if (nextStepFlows.length > 0) {
      // Move to next step
      await expense.update({
        approval_step: nextStep,
        current_approver_id: nextStepFlows[0].approver_id
      });

      return { moved: true, status: 'Under Review', next_step: nextStep };
    } else {
      // Check final approval status
      const approved = await this.checkFinalApproval(expense, allFlows);
      const newStatus = approved ? 'Approved' : 'Rejected';

      await expense.update({
        status: newStatus,
        approved_date: approved ? new Date() : null,
        current_approver_id: null
      });

      return { moved: true, status: newStatus, completed: true };
    }
  }

  async checkFinalApproval(expense, allFlows) {
    // Get the rule that was applied
    const rule = expense.rule_applied ? 
      await ApprovalRule.findByPk(expense.rule_applied) : null;

    if (rule?.rule_type === 'Percentage') {
      return await this.checkPercentageApproval(rule, allFlows);
    }

    if (rule?.auto_approve_conditions) {
      const autoApproved = await this.checkAutoApprovalConditions(rule, allFlows);
      if (autoApproved) return true;
    }

    // Default logic: all required approvals must be approved
    const requiredFlows = allFlows.filter(f => f.is_required);
    const approvedRequired = requiredFlows.filter(f => f.status === 'Approved');

    return approvedRequired.length === requiredFlows.length;
  }

  async checkPercentageApproval(rule, allFlows) {
    const totalApprovers = allFlows.length;
    const approvedCount = allFlows.filter(f => f.status === 'Approved').length;
    const approvalPercentage = (approvedCount / totalApprovers) * 100;

    return approvalPercentage >= rule.percentage_required;
  }

  async checkAutoApprovalConditions(rule, allFlows) {
    const conditions = rule.auto_approve_conditions;

    if (conditions.cfo_approval) {
      const cfoApproval = allFlows.find(f => 
        f.approver_type === 'CFO' && f.status === 'Approved'
      );
      if (cfoApproval) return true;
    }

    if (conditions.director_approval) {
      const directorApproval = allFlows.find(f => 
        f.approver_type === 'Director' && f.status === 'Approved'
      );
      if (directorApproval) return true;
    }

    return false;
  }

  clearCache() {
    this.ruleCache.clear();
  }
}

module.exports = {
  approvalEngine: new ApprovalEngine(),
  ApprovalEngine
};