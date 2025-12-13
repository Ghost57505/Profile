const jwt = require('jsonwebtoken');

const generateToken = (userId, expiresIn = '7d') => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_secret_key', {
    expiresIn
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const generateMFACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  generateToken,
  verifyToken,
  generateMFACode
};
