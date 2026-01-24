const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/equipment - ดูรายการอุปกรณ์ทั้งหมด
router.get('/', authenticateToken, equipmentController.getAllEquipment);

// GET /api/equipment/stats - ดูสถิติอุปกรณ์
router.get('/stats', authenticateToken, equipmentController.getEquipmentStats);

// POST /api/equipment/seed - เพิ่มข้อมูลอุปกรณ์เริ่มต้น (admin only)
router.post('/seed', authenticateToken, requireAdmin, equipmentController.seedEquipment);

// GET /api/equipment/:id - ดูรายละเอียดอุปกรณ์
router.get('/:id', authenticateToken, equipmentController.getEquipmentById);

// POST /api/equipment - เพิ่มอุปกรณ์ใหม่
router.post('/', authenticateToken, requireAdmin, equipmentController.createEquipment);

// PUT /api/equipment/:id - แก้ไขข้อมูลอุปกรณ์
router.put('/:id', authenticateToken, requireAdmin, equipmentController.updateEquipment);

// DELETE /api/equipment/:id - ลบอุปกรณ์
router.delete('/:id', authenticateToken, requireAdmin, equipmentController.deleteEquipment);

module.exports = router;
