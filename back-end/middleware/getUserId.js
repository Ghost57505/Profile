/**
 * Middleware to extract userId from request body, query, or Authorization header
 * Used for data collection endpoints that don't require token validation
 */
const getUserId = (req, res, next) => {
  try {
    // Try to get userId from body, query, or Authorization header
    let userId = req.body.userId || req.query.userId;
    
    // If not found, try Authorization header (Bearer token)
    if (!userId && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        userId = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
    
    if (!userId) {
      return res.status(400).json({});
    }

    req.userId = userId;
    next();
  } catch (error) {
    res.status(400).json({});
  }
};

module.exports = getUserId;
