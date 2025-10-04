// Role-Based Access Control Middleware

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

const checkOwnership = (resourceOwnerField = 'submitted_by') => {
  return (req, res, next) => {
    // Admin and Manager roles can access any resource
    if (['Admin', 'Manager'].includes(req.user.role)) {
      return next();
    }

    // For other roles, check ownership
    req.checkOwnership = (resource) => {
      return resource[resourceOwnerField] === req.user.id;
    };

    next();
  };
};

const checkCompanyAccess = () => {
  return (req, res, next) => {
    req.checkCompanyAccess = (resource) => {
      return resource.company_id === req.user.company_id;
    };

    next();
  };
};

const requireSameCompany = () => {
  return (req, res, next) => {
    req.requireSameCompany = true;
    next();
  };
};

module.exports = {
  authorize,
  checkOwnership,
  checkCompanyAccess,
  requireSameCompany
};