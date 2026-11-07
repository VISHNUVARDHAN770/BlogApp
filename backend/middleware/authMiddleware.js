const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token missing'
      });
    }

    const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({
            success: false,
            message: 'Token expired'
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication middleware'
    });
  }
};

module.exports = authMiddleware;
