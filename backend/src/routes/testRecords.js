const express = require('express')
const router = express.Router()
const testRecordsController = require('../controllers/testRecordsController')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

// ดึงข้อมูลบันทึกการทดสอบทั้งหมด
router.get('/', authenticateToken, testRecordsController.getAllTestRecords)

// ดึงข้อมูลสถิติการทดสอบ
router.get('/stats', authenticateToken, testRecordsController.getTestStats)

// ดึงข้อมูลการทดสอบล่าสุด
router.get('/latest', authenticateToken, testRecordsController.getLatestTestRecords)

// ส่งออกข้อมูลเป็น Excel (ต้องอยู่ก่อน /:id)
router.get('/export/excel', authenticateToken, testRecordsController.exportTestRecords)

// ดึงข้อมูลบันทึกการทดสอบตาม ID
router.get('/:id', authenticateToken, testRecordsController.getTestRecordById)

// สร้างบันทึกการทดสอบใหม่
router.post('/', authenticateToken, testRecordsController.createTestRecord)

// แก้ไขบันทึกการทดสอบ
router.put('/:id', authenticateToken, testRecordsController.updateTestRecord)

// ลบบันทึกการทดสอบ
router.delete('/:id', authenticateToken, requireAdmin, testRecordsController.deleteTestRecord)

module.exports = router
