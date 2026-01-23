const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedUsers() {
  try {
    console.log('🌱 กำลังเพิ่มข้อมูลผู้ใช้เริ่มต้น...');
    
    // เชื่อมต่อ database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'esd_equipment_db'
    });

    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');

    // Hash passwords
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // เพิ่มข้อมูลผู้ใช้
    const users = [
      {
        username: 'admin',
        email: 'admin@esd.com',
        password_hash: hashedPassword,
        role: 'admin',
        full_name: 'System Administrator'
      },
      {
        username: 'operator1',
        email: 'operator1@esd.com',
        password_hash: hashedPassword,
        role: 'operator',
        full_name: 'Test Operator 1'
      },
      {
        username: 'inspector1',
        email: 'inspector1@esd.com',
        password_hash: hashedPassword,
        role: 'inspector',
        full_name: 'Quality Inspector 1'
      }
    ];

    // ล้างข้อมูลเก่าและเพิ่มข้อมูลใหม่
    await connection.execute('DELETE FROM users');
    
    for (const user of users) {
      await connection.execute(
        'INSERT INTO users (username, email, password_hash, role, full_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [user.username, user.email, user.password_hash, user.role, user.full_name]
      );
      console.log(`✅ เพิ่มผู้ใช้: ${user.username}`);
    }

    // ปิดการเชื่อมต่อ
    await connection.end();

    console.log('🎉 เพิ่มข้อมูลผู้ใช้เรียบร้อยแล้ว!');
    console.log('📝 บัญชีทดสอบ:');
    console.log('   Admin: admin / password123');
    console.log('   Operator: operator1 / password123');
    console.log('   Inspector: inspector1 / password123');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูลผู้ใช้:', error.message);
    process.exit(1);
  }
}

seedUsers();
