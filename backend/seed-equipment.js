const { sequelize } = require('./src/utils/database');
const Equipment = require('./src/models/Equipment');

const equipmentData = [
  {
    name: "เครื่องวัดค่าความต้านทาน ESD-01",
    model: "Fluke 8846A",
    serial_number: "ESD2024001",
    calibration_date: "2024-01-15",
    status: "active",
    location: "Lab A - ชั้น 2",
    description: "เครื่องวัดค่าความต้านทานความแม่นยำสูง 6.5 หลัก สำหรับทดสอบ ESD"
  },
  {
    name: "เครื่องวัดค่าความต้านทาน ESD-02",
    model: "Keysight 34461A",
    serial_number: "ESD2024002",
    calibration_date: "2024-02-20",
    status: "active",
    location: "Lab B - ชั้น 1",
    description: "Digital Multimeter 6.5 หลัก พร้อมฟังก์ชัน ESD testing"
  },
  {
    name: "เครื่องวัดค่าความต้านทาน ESD-03",
    model: "Hioki RM3545",
    serial_number: "ESD2024003",
    calibration_date: "2024-01-10",
    status: "maintenance",
    location: "Lab A - ชั้น 3",
    description: "Resistance Meter พร้อม ESD probe สำหรับงานทดสอบ"
  },
  {
    name: "เครื่องวัดค่าความต้านทาน ESD-04",
    model: "Fluke 87V",
    serial_number: "ESD2024004",
    calibration_date: "2023-12-05",
    status: "active",
    location: "Lab C - ชั้น 1",
    description: "True RMS Multimeter สำหรับทดสอบค่าความต้านทาน ESD"
  },
  {
    name: "เครื่องวัดค่าความต้านทาน ESD-05",
    model: "Agilent 34401A",
    serial_number: "ESD2024005",
    calibration_date: "2024-03-01",
    status: "active",
    location: "Lab B - ชั้น 2",
    description: "6.5 Digit Multimeter สำหรับงานทดสอบความต้านทานความแม่นยำสูง"
  }
];

async function seedEquipment() {
  try {
    await sequelize.sync({ force: false });
    
    console.log('กำลังเพิ่มข้อมูลอุปกรณ์...');
    
    for (const equipment of equipmentData) {
      await Equipment.findOrCreate({
        where: { serial_number: equipment.serial_number },
        defaults: equipment
      });
    }
    
    console.log('เพิ่มข้อมูลอุปกรณ์สำเร็จ!');
    console.log(`จำนวนอุปกรณ์ทั้งหมด: ${equipmentData.length} เครื่อง`);
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    await sequelize.close();
  }
}

seedEquipment();
