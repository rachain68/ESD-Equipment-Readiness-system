const express = require('express');
const router = express.Router();
const {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentStats
} = require('../controllers/equipmentController');

// GET /api/equipment - ดูรายการอุปกรณ์ทั้งหมด
router.get('/', getAllEquipment);

// GET /api/equipment/stats - ดูสถิติอุปกรณ์
router.get('/stats', getEquipmentStats);

// GET /api/equipment/:id - ดูรายละเอียดอุปกรณ์
router.get('/:id', getEquipmentById);

// POST /api/equipment - เพิ่มอุปกรณ์ใหม่
router.post('/', createEquipment);

// PUT /api/equipment/:id - แก้ไขข้อมูลอุปกรณ์
router.put('/:id', updateEquipment);

// DELETE /api/equipment/:id - ลบอุปกรณ์
router.delete('/:id', deleteEquipment);

module.exports = router;
