const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

// POST /api/auth/register - สมัครสมาชิก
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, full_name, role = 'operator' } = req.body;

    // ตรวจสอบว่ามีผู้ใช้นี้อยู่แล้วหรือไม่
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' 
      });
    }

    // เข้ารหัสรหัสผ่าน
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // สร้างผู้ใช้ใหม่
    const user = await User.create({
      username,
      email,
      password_hash,
      full_name,
      role
    });

    // สร้าง JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // ส่งข้อมูลผู้ใช้กลับโดยไม่รวม password_hash
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at
    };

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login - เข้าสู่ระบบ
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // ค้นหาผู้ใช้
    const user = await User.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // ส่งข้อมูลผู้ใช้กลับโดยไม่รวม password_hash
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at
    };

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/profile - ดูข้อมูลผู้ใช้ปัจจุบัน
router.get('/profile', async (req, res) => {
  try {
    // ตรวจสอบ token จาก header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'ไม่มี token กรุณาเข้าสู่ระบบ' });
    }

    // ตรวจสอบความถูกต้องของ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }

    res.json(user);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token ไม่ถูกต้อง' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile - อัปเดตข้อมูลผู้ใช้
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'ไม่มี token กรุณาเข้าสู่ระบบ' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { full_name, email } = req.body;

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่ (ถ้ามีการเปลี่ยนแปลง)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { 
          email,
          id: { [User.sequelize.Op.ne]: decoded.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'อีเมลนี้มีผู้ใช้อื่นใช้แล้ว' });
      }
    }

    await user.update({ full_name, email });

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({
      message: 'อัปเดตข้อมูลสำเร็จ',
      user: userResponse
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token ไม่ถูกต้อง' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
