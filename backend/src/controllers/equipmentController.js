const { Equipment, TestRecord } = require('../models');
const { Op } = require('sequelize');

// ดูรายการอุปกรณ์ทั้งหมด
const getAllEquipment = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { serial_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: equipment } = await Equipment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      equipment,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ดูรายละเอียดอุปกรณ์
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const equipment = await Equipment.findByPk(id, {
      include: [{
        model: TestRecord,
        as: 'testRecords',
        limit: 10,
        order: [['test_date', 'DESC']]
      }]
    });

    if (!equipment) {
      return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
    }

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// เพิ่มอุปกรณ์ใหม่
const createEquipment = async (req, res) => {
  try {
    const {
      name,
      model,
      serial_number,
      calibration_date,
      status = 'active',
      location,
      description
    } = req.body;

    // ตรวจสอบว่า serial_number ซ้ำหรือไม่
    if (serial_number) {
      const existingEquipment = await Equipment.findOne({
        where: { serial_number }
      });

      if (existingEquipment) {
        return res.status(400).json({ error: 'Serial Number นี้มีอยู่แล้ว' });
      }
    }

    const equipment = await Equipment.create({
      name,
      model,
      serial_number,
      calibration_date,
      status,
      location,
      description
    });

    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// แก้ไขข้อมูลอุปกรณ์
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // ตรวจสอบว่า serial_number ซ้ำหรือไม่ (ถ้ามีการเปลี่ยนแปลง)
    if (updateData.serial_number) {
      const existingEquipment = await Equipment.findOne({
        where: { 
          serial_number: updateData.serial_number,
          id: { [Op.ne]: id }
        }
      });

      if (existingEquipment) {
        return res.status(400).json({ error: 'Serial Number นี้มีอยู่แล้ว' });
      }
    }

    const [updatedRowsCount] = await Equipment.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
    }

    const updatedEquipment = await Equipment.findByPk(id);
    res.json(updatedEquipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ลบอุปกรณ์
const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRowsCount = await Equipment.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
    }

    res.json({ message: 'ลบอุปกรณ์เรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ดูสถิติอุปกรณ์
const getEquipmentStats = async (req, res) => {
  try {
    const totalEquipment = await Equipment.count();
    const activeEquipment = await Equipment.count({ where: { status: 'active' } });
    const maintenanceEquipment = await Equipment.count({ where: { status: 'maintenance' } });
    const retiredEquipment = await Equipment.count({ where: { status: 'retired' } });

    res.json({
      total: totalEquipment,
      active: activeEquipment,
      maintenance: maintenanceEquipment,
      retired: retiredEquipment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentStats
};
