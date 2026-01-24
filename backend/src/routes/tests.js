const express = require('express');
const router = express.Router();
const {
  createTestRecord,
  getAllTestRecords,
  getTestRecordById,
  updateTestRecord,
  deleteTestRecord,
  getTestStats,
  getLatestTestRecords
} = require('../controllers/testController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/tests - ดูประวัติการทดสอบทั้งหมด
router.get('/', authenticateToken, getAllTestRecords);

// GET /api/tests/stats - ดูสถิติการทดสอบ
router.get('/stats', authenticateToken, getTestStats);

// GET /api/tests/latest - ดูข้อมูลการทดสอบล่าสุด
router.get('/latest', authenticateToken, getLatestTestRecords);

// GET /api/tests/:id - ดูรายละเอียดการทดสอบ
router.get('/:id', authenticateToken, getTestRecordById);

// POST /api/tests - บันทึกข้อมูลการทดสอบ
router.post('/', authenticateToken, createTestRecord);

// PUT /api/tests/:id - แก้ไขข้อมูลการทดสอบ
router.put('/:id', authenticateToken, updateTestRecord);

// DELETE /api/tests/:id - ลบข้อมูลการทดสอบ
router.delete('/:id', authenticateToken, deleteTestRecord);

module.exports = router;
