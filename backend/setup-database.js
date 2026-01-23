const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🔧 กำลังตั้งค่าฐานข้อมูล...');
    
    // เชื่อมต่อ MySQL (ไม่ระบุ database)
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✅ เชื่อมต่อ MySQL สำเร็จ');

    // สร้าง database ถ้ายังไม่มี
    await connection.execute('CREATE DATABASE IF NOT EXISTS esd_equipment_db');
    console.log('✅ สร้าง database esd_equipment_db สำเร็จ');

    // ปิดการเชื่อมต่อ
    await connection.end();

    console.log('🎉 ตั้งค่าฐานข้อมูลเสร็จสิ้น!');
    console.log('📝 ข้อมูลการเชื่อมต่อ:');
    console.log('   Host: localhost');
    console.log('   Database: esd_equipment_db');
    console.log('   User: root');
    console.log('   Password: 1234');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตั้งค่าฐานข้อมูล:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 แนะนำ: ตรวจสอบว่า MySQL ทำงานอยู่และรหัสผ่านถูกต้อง');
      console.log('   - ตรวจสอบว่า MySQL service ทำงานอยู่');
      console.log('   - ลองรหัสผ่าน: 1234, ว่าง, หรือรหัสที่คุณตั้งไว้');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 แนะนำ: MySQL ไม่ทำงาน');
      console.log('   - เปิด MySQL service');
      console.log('   - ติดตั้ง MySQL ถ้ายังไม่ได้ติดตั้ง');
    }
    
    process.exit(1);
  }
}

setupDatabase();
