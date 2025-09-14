/**
 * Role-based access control middleware
 */

/**
 * Check if user has required role
 * @param {Array|String} roles - Array of allowed roles or single role string
 * @returns {Function} Express middleware function
 */
const checkRole = (roles) => {
  // Convert single role to array for consistent handling
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    try {
      // Check if user is authenticated (should be set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has required role
      if (!req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'User role not defined'
        });
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during role validation'
      });
    }
  };
};

/**
 * Check if user is an instructor
 */
const isInstructor = checkRole(['instructor', 'admin']);

/**
 * Check if user is an admin
 */
const isAdmin = checkRole('admin');

/**
 * Check if user is a student
 */
const isStudent = checkRole(['student', 'instructor', 'admin']);

/**
 * Check if user is instructor or admin
 */
const isInstructorOrAdmin = checkRole(['instructor', 'admin']);

module.exports = {
  checkRole,
  isInstructor,
  isAdmin,
  isStudent,
  isInstructorOrAdmin
};