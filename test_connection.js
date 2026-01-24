// ทดสอบการเชื่อมต่อ API
const axios = require('axios');

async function testConnection() {
  try {
    console.log('🔍 ทดสอบการเชื่อมต่อ Backend...');
    
    // ทดสอบ basic connection
    const response = await axios.get('http://localhost:3000/api/equipment/stats', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Backend เชื่อมต่อสำเร็จ');
    console.log('📊 Response:', response.data);
    
    // ทดสอบ equipment list
    const equipmentResponse = await axios.get('http://localhost:3000/api/equipment', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Equipment List:', equipmentResponse.data);
    
  } catch (error) {
    console.error('❌ การเชื่อมต่อล้มเหลว:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testConnection();
