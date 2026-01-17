const auth = require('./auth');

const adminAuth = async (req, res, next) => {
  try {
    // First run the auth middleware
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user has admin or moderator role
    if (req.user.role === 'admin' || req.user.role === 'moderator') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin only.' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = adminAuth;
