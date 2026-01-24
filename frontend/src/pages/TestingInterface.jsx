import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentAPI, testAPI } from '../services/api'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { 
  PlayIcon, 
  StopIcon, 
  ClockIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const TestingInterface = () => {
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [currentValue, setCurrentValue] = useState(0)
  const [testHistory, setTestHistory] = useState([])
  const [serialPort, setSerialPort] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('ยังไม่ได้เชื่อมต่อ')
  const [testData, setTestData] = useState({
    resistance_value: '',
    temperature: '',
    humidity: '',
    notes: ''
  })

  const { user } = useAuth()
  const { emitTestData } = useSocket()
  const queryClient = useQueryClient()

  // ดึงข้อมูลอุปกรณ์ที่ใช้งานได้
  const { data: equipmentData } = useQuery({
    queryKey: ['equipment-active'],
    queryFn: () => equipmentAPI.getAll({ status: 'active' }).then(res => res.data)
  })

  // ดึงข้อมูลการทดสอบล่าสุด
  const { data: latestTests } = useQuery({
    queryKey: ['latest-tests-10'],
    queryFn: () => testAPI.getLatest({ limit: 10 }).then(res => res.data)
  })

  // บันทึกการทดสอบ
  const testMutation = useMutation({
    mutationFn: testAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['latest-tests'] })
      queryClient.invalidateQueries({ queryKey: ['test-stats'] })
      toast.success('บันทึกข้อมูลการทดสอบสำเร็จ')
      
      // ส่งข้อมูลไปยัง socket
      emitTestData({
        equipment_id: selectedEquipment,
        resistance_value: parseFloat(testData.resistance_value),
        temperature: testData.temperature ? parseFloat(testData.temperature) : null,
        humidity: testData.humidity ? parseFloat(testData.humidity) : null,
        notes: testData.notes
      })
      
      // รีเซ็ตฟอร์ม
      setTestData({
        resistance_value: '',
        temperature: '',
        humidity: '',
        notes: ''
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'บันทึกข้อมูลไม่สำเร็จ')
    }
  })

  // เชื่อมต่อกับ Serial Port (COM5)
  const connectSerialPort = async () => {
    try {
      // ตรวจสอบว่า Browser รองรับ Web Serial API หรือไม่
      if (!navigator.serial) {
        toast.error('Browser ไม่รองรับ Web Serial API กรุณาใช้ Chrome/Edge')
        return
      }

      setConnectionStatus('กำลังเชื่อมต่อ...')
      
      // ขอ permission และเชื่อมต่อกับพอร์ต
      const port = await navigator.serial.requestPort()
      
      // ตั้งค่าการเชื่อมต่อ (COM5 คือพอร์ตที่ต้องการ)
      await port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      })

      setSerialPort(port)
      setIsConnected(true)
      setConnectionStatus('เชื่อมต่อสำเร็จ')
      toast.success('เชื่อมต่อกับอุปกรณ์สำเร็จ')

      // เริ่มอ่านข้อมูลจากพอร์ต
      readSerialData(port)

    } catch (error) {
      console.error('Serial connection error:', error)
      setConnectionStatus('เชื่อมต่อล้มเหลว: ' + error.message)
      toast.error('เชื่อมต่อกับอุปกรณ์ล้มเหลว: ' + error.message)
    }
  }

  // ตัดการเชื่อมต่อ Serial Port
  const disconnectSerialPort = async () => {
    try {
      if (serialPort && serialPort.readable) {
        await serialPort.close()
      }
      setSerialPort(null)
      setIsConnected(false)
      setConnectionStatus('ยังไม่ได้เชื่อมต่อ')
      setCurrentValue(0)
      setIsTesting(false)
      toast.success('ตัดการเชื่อมต่อสำเร็จ')
    } catch (error) {
      console.error('Disconnect error:', error)
      toast.error('ตัดการเชื่อมต่อล้มเหลว')
    }
  }

  // อ่านข้อมูลจาก Serial Port
  const readSerialData = async (port) => {
    const textDecoder = new TextDecoderStream()
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable)
    const reader = textDecoder.readable.getReader()

    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }
        
        // แปลงข้อมูลที่ได้รับ
        if (value) {
          processSerialData(value.trim())
        }
      }
    } catch (error) {
      console.error('Read error:', error)
    } finally {
      reader.releaseLock()
    }
  }

  // ประมวลผลข้อมูลจาก Serial Port
  const processSerialData = (data) => {
    try {
      // สมมติว่าข้อมูลมาในรูปแบบ "RESISTANCE:123.45" หรือแค่ตัวเลข
      let resistanceValue = 0
      
      if (data.includes('RESISTANCE:')) {
        resistanceValue = parseFloat(data.split(':')[1])
      } else if (data.includes('OHM:')) {
        resistanceValue = parseFloat(data.split(':')[1])
      } else {
        // ลองแปลงเป็นตัวเลขโดยตรง
        const numValue = parseFloat(data)
        if (!isNaN(numValue)) {
          resistanceValue = numValue
        }
      }

      if (!isNaN(resistanceValue) && resistanceValue >= 0) {
        setCurrentValue(resistanceValue.toFixed(2))
        
        // เพิ่มลงประวัติถ้ากำลังทดสอบ
        if (isTesting) {
          const newRecord = {
            id: Date.now(),
            value: resistanceValue,
            timestamp: new Date()
          }
          setTestHistory(prev => [newRecord, ...prev].slice(0, 10))
        }
      }
    } catch (error) {
      console.error('Data processing error:', error)
    }
  }

  const handleStartTest = () => {
    if (!selectedEquipment) {
      toast.error('กรุณาเลือกอุปกรณ์')
      return
    }
    
    if (!isConnected) {
      toast.error('กรุณาเชื่อมต่อกับอุปกรณ์ก่อนเริ่มทดสอบ')
      return
    }
    
    setIsTesting(true)
    // ไม่ต้อง simulateTest แล้วเพราะอ่านค่าจาก Serial Port จริง
  }

  const handleStopTest = () => {
    setIsTesting(false)
    // ไม่รีเซ็ตค่าเพื่อให้เห็นค่าล่าสุดจากอุปกรณ์
  }

  // ลบฟังก์ชัน simulateTest ออกเนื่องจากใช้ Serial Port จริงแล้ว

  const handleSaveTest = () => {
    if (!selectedEquipment) {
      toast.error('กรุณาเลือกอุปกรณ์')
      return
    }
    
    if (!testData.resistance_value) {
      toast.error('กรุณากรอกค่าความต้านทาน')
      return
    }

    testMutation.mutate({
      equipment_id: parseInt(selectedEquipment),
      resistance_value: parseFloat(testData.resistance_value),
      temperature: testData.temperature || null,
      humidity: testData.humidity || null,
      notes: testData.notes,
      test_status: 'pass' // กำหนดค่าเริ่มต้นเป็น pass
    })
  }

  const getEquipmentName = (id) => {
    const equipment = equipmentData?.equipment?.find(eq => eq.id === parseInt(id))
    return equipment?.name || 'ไม่พบอุปกรณ์'
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pass: { color: 'badge-success', text: 'ผ่าน' },
      fail: { color: 'badge-error', text: 'ไม่ผ่าน' },
      pending: { color: 'badge-warning', text: 'รอดำเนินการ' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return <span className={`badge ${config.color}`}>{config.text}</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">การทดสอบ</h1>
        <p className="text-gray-600">ทดสอบและบันทึกข้อมูลเครื่องวัดค่าความต้านทาน</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Testing Panel */}
        <div className="space-y-6">
          {/* Equipment Selection */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">เลือกอุปกรณ์</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อุปกรณ์ที่จะทดสอบ
                </label>
                <select
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  className="input"
                  disabled={isTesting}
                >
                  <option value="">-- เลือกอุปกรณ์ --</option>
                  {equipmentData?.equipment?.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>
                      {equipment.name} ({equipment.model || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedEquipment && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>อุปกรณ์:</strong> {getEquipmentName(selectedEquipment)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Display */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">ค่าความต้านทานแบบเรียลไทม์</h3>
            </div>
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">สถานะการเชื่อมต่อ:</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {connectionStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">
                  {currentValue} <span className="text-lg text-gray-500">Ω</span>
                </div>
                <div className="flex items-center justify-center mt-2">
                  {isTesting ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      <span className="text-sm text-gray-600">กำลังทดสอบ...</span>
                    </>
                  ) : isConnected ? (
                    <span className="text-sm text-green-600">พร้อมทดสอบ</span>
                  ) : (
                    <span className="text-sm text-gray-500">ยังไม่ได้เชื่อมต่อ</span>
                  )}
                </div>
              </div>

              {/* Connection/Testing Controls */}
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <button
                    onClick={connectSerialPort}
                    disabled={isConnected}
                    className={`flex-1 ${isConnected ? 'btn-outline opacity-50 cursor-not-allowed' : 'btn-primary'}`}
                  >
                    {isConnected ? 'เชื่อมต่อแล้ว' : 'เชื่อมต่ออุปกรณ์'}
                  </button>
                  <button
                    onClick={disconnectSerialPort}
                    disabled={!isConnected}
                    className={`flex-1 ${!isConnected ? 'btn-outline opacity-50 cursor-not-allowed' : 'btn-error'}`}
                  >
                    ตัดการเชื่อมต่อ
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleStartTest}
                    disabled={isTesting || !selectedEquipment || !isConnected}
                    className={`flex-1 btn-success ${(isTesting || !selectedEquipment || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    เริ่มทดสอบ
                  </button>
                  <button
                    onClick={handleStopTest}
                    disabled={!isTesting}
                    className={`flex-1 btn-error ${!isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <StopIcon className="w-4 h-4 mr-2" />
                    หยุดทดสอบ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Test History */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">ประวัติการทดสอบครั้งนี้</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {testHistory.length > 0 ? (
                testHistory.map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{record.value} Ω</span>
                    <span className="text-xs text-gray-500">
                      {record.timestamp.toLocaleTimeString('th-TH')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">ยังไม่มีข้อมูลการทดสอบ</p>
              )}
            </div>
          </div>
        </div>

        {/* Data Entry Panel */}
        <div className="space-y-6">
          {/* Test Data Form */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">บันทึกข้อมูลการทดสอบ</h3>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveTest(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ค่าความต้านทาน (Ω) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={testData.resistance_value}
                  onChange={(e) => setTestData({...testData, resistance_value: e.target.value})}
                  className="input"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อุณหภูมิ (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={testData.temperature}
                    onChange={(e) => setTestData({...testData, temperature: e.target.value})}
                    className="input"
                    placeholder="25.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ความชื้น (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={testData.humidity}
                    onChange={(e) => setTestData({...testData, humidity: e.target.value})}
                    className="input"
                    placeholder="60.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมายเหตุ
                </label>
                <textarea
                  rows={3}
                  value={testData.notes}
                  onChange={(e) => setTestData({...testData, notes: e.target.value})}
                  className="input"
                  placeholder="บันทึกข้อสังเกต..."
                />
              </div>

              <button
                type="submit"
                disabled={testMutation.isPending}
                className="w-full btn-primary"
              >
                {testMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2" />
                    กำลังบันทึก...
                  </div>
                ) : (
                  'บันทึกข้อมูล'
                )}
              </button>
            </form>
          </div>

          {/* Recent Tests */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">การทดสอบล่าสุด</h3>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {latestTests?.length > 0 ? (
                latestTests.map((test) => (
                  <div key={test.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {test.equipment?.name || 'Unknown Equipment'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {parseFloat(test.resistance_value).toFixed(2)} Ω
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(test.test_date).toLocaleString('th-TH')}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(test.test_status)}
                        {test.operator && (
                          <p className="text-xs text-gray-500 mt-1">
                            {test.operator.full_name || test.operator.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">ยังไม่มีข้อมูลการทดสอบ</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestingInterface
