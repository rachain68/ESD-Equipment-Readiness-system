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

// GET /api/tests - ดูประวัติการทดสอบทั้งหมด
router.get('/', getAllTestRecords);

// GET /api/tests/stats - ดูสถิติการทดสอบ
router.get('/stats', getTestStats);

// GET /api/tests/latest - ดูข้อมูลการทดสอบล่าสุด
router.get('/latest', getLatestTestRecords);

// GET /api/tests/:id - ดูรายละเอียดการทดสอบ
router.get('/:id', getTestRecordById);

// POST /api/tests - บันทึกข้อมูลการทดสอบ
router.post('/', createTestRecord);

// PUT /api/tests/:id - แก้ไขข้อมูลการทดสอบ
router.put('/:id', updateTestRecord);

// DELETE /api/tests/:id - ลบข้อมูลการทดสอบ
router.delete('/:id', deleteTestRecord);

module.exports = router;
