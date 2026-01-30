const jwt = require('jsonwebtoken');
const { User } = require('../models');

// ตรวจสอบ token ว่าถูกต้องหรือไม่
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'กรุณากรอกข้อมูลการเข้าสู่ระบบ' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'full_name', 'email', 'role']
    });

    if (!user) {
      return res.status(401).json({ error: 'ไม่พบผู้ใช้นี้ในระบบ' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};

// ตรวจสอบว่าเป็น admin หรือไม่
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'ต้องการสิทธิ์ผู้ดูแลระบบ' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin
};
