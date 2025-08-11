const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'personal-dev-jwt-secret-key-2024';

/**
 * Authentication middleware to verify JWT tokens
 * Extracts user information and adds it to req.user
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Add user information to request object
    req.user = user;
    next();
  });
};

/**
 * Optional authentication middleware
 * Does not fail if no token provided, but adds user info if token exists
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  optionalAuth
};