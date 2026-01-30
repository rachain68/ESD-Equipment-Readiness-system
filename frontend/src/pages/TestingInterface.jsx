import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentAPI, testRecordsAPI } from '../services/api'
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
  const [testType, setTestType] = useState('daily_check')
  const [testData, setTestData] = useState({
    test_type: 'daily_check',
    cal_test: '',
    cal_first_retest: '',
    cal_second_retest: '',
    golden_conductive_test: '',
    golden_conductive_first_retest: '',
    golden_conductive_second_retest: '',
    golden_insulative_test: '',
    golden_insulative_first_retest: '',
    golden_insulative_second_retest: '',
    temperature: '',
    humidity: '',
    notes: ''
  })

  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Use backend data; remove local mock data

  // ดึงข้อมูลอุปกรณ์ที่ใช้งานได้
  const { data: equipmentData } = useQuery({
    queryKey: ['equipment-active'],
    queryFn: () => equipmentAPI.getAll({ status: 'active' }).then(res => res.data?.equipment || res.data || []),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: true,
  })

  // ดึงข้อมูลการทดสอบล่าสุด (ปิดชั่วคราวเพื่อแก้ไขปัญหา refresh)
  const { data: latestTests } = useQuery({
    queryKey: ['latest-tests-10'],
    queryFn: () => testRecordsAPI.getAll({ limit: 10 }).then(res => res.data?.test_records || res.data || []),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: true,
  })

  // ใช้ข้อมูลจริงถ้ามี หรือใช้ข้อมูลจำลอง
  const equipment = equipmentData || []
  const latestTestsData = latestTests || []

  // บันทึกการทดสอบ
  const testMutation = useMutation({
    mutationFn: testRecordsAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['latest-tests'] })
      queryClient.invalidateQueries({ queryKey: ['test-stats'] })
      toast.success('บันทึกข้อมูลการทดสอบสำเร็จ')
      
      // รีเซ็ตฟอร์ม
      setTestData({
        test_type: testType,
        cal_test: '',
        cal_first_retest: '',
        cal_second_retest: '',
        golden_conductive_test: '',
        golden_conductive_first_retest: '',
        golden_conductive_second_retest: '',
        golden_insulative_test: '',
        golden_insulative_first_retest: '',
        golden_insulative_second_retest: '',
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
    
    // ตรวจสอบค่าที่จำเป็นตามประเภทการทดสอบ
    let hasRequiredData = false
    
    if (testType === 'daily_check' || testType === 'cal_test' || testType === 'full_test') {
      if (testData.cal_test) hasRequiredData = true
    }
    if (testType === 'daily_check' || testType === 'golden_conductive' || testType === 'full_test') {
      if (testData.golden_conductive_test) hasRequiredData = true
    }
    if (testType === 'daily_check' || testType === 'golden_insulative' || testType === 'full_test') {
      if (testData.golden_insulative_test) hasRequiredData = true
    }
    
    if (!hasRequiredData) {
      toast.error('กรุณากรอกข้อมูลการทดสอบอย่างน้อย 1 ค่า')
      return
    }

    // สร้างข้อมูลที่จะส่งไปบันทึก
    const dataToSave = {
      equipment_id: parseInt(selectedEquipment),
      test_type: testType,
      temperature: testData.temperature || null,
      humidity: testData.humidity || null,
      notes: testData.notes,
      test_status: 'pending'
    }

    // เพิ่มข้อมูลตามประเภทการทดสอบ
    if (testType === 'daily_check' || testType === 'cal_test' || testType === 'full_test') {
      dataToSave.cal_test = parseFloat(testData.cal_test) || null
      dataToSave.cal_first_retest = parseFloat(testData.cal_first_retest) || null
      dataToSave.cal_second_retest = parseFloat(testData.cal_second_retest) || null
    }
    if (testType === 'daily_check' || testType === 'golden_conductive' || testType === 'full_test') {
      dataToSave.golden_conductive_test = parseFloat(testData.golden_conductive_test) || null
      dataToSave.golden_conductive_first_retest = parseFloat(testData.golden_conductive_first_retest) || null
      dataToSave.golden_conductive_second_retest = parseFloat(testData.golden_conductive_second_retest) || null
    }
    if (testType === 'daily_check' || testType === 'golden_insulative' || testType === 'full_test') {
      dataToSave.golden_insulative_test = parseFloat(testData.golden_insulative_test) || null
      dataToSave.golden_insulative_first_retest = parseFloat(testData.golden_insulative_first_retest) || null
      dataToSave.golden_insulative_second_retest = parseFloat(testData.golden_insulative_second_retest) || null
    }

    testMutation.mutate(dataToSave)
  }

  const getEquipmentName = (id) => {
    const equipmentItem = equipment?.find(eq => eq.id === parseInt(id))
    return equipmentItem?.name || 'ไม่พบอุปกรณ์'
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
                  {equipment?.map((equipment) => (
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
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <button
                    onClick={connectSerialPort}
                    disabled={isConnected}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${
                      isConnected 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {isConnected ? 'เชื่อมต่อแล้ว' : 'เชื่อมต่ออุปกรณ์'}
                  </button>
                  <button
                    onClick={disconnectSerialPort}
                    disabled={!isConnected}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${
                      !isConnected 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    ตัดการเชื่อมต่อ
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleStartTest}
                    disabled={isTesting || !selectedEquipment || !isConnected}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${
                      (isTesting || !selectedEquipment || !isConnected)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    เริ่มทดสอบ
                  </button>
                  <button
                    onClick={handleStopTest}
                    disabled={!isTesting}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${
                      !isTesting 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
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
              {/* Test Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภทการทดสอบ *
                </label>
                <select
                  value={testType}
                  onChange={(e) => {
                    setTestType(e.target.value)
                    setTestData({...testData, test_type: e.target.value})
                  }}
                  className="input"
                  disabled={isTesting}
                >
                  <option value="daily_check">การทดสอบเช็คประจำวัน</option>
                </select>
              </div>

              {/* CAL Test Results */}
              {(testType === 'daily_check' || testType === 'cal_test' || testType === 'full_test') && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">ผลการทดสอบ CAL (Ω)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Test</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testData.cal_test}
                        onChange={(e) => setTestData({...testData, cal_test: e.target.value})}
                        className="input text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">1st Re-test</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testData.cal_first_retest}
                        onChange={(e) => setTestData({...testData, cal_first_retest: e.target.value})}
                        className="input text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">2nd Re-test</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testData.cal_second_retest}
                        onChange={(e) => setTestData({...testData, cal_second_retest: e.target.value})}
                        className="input text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Golden Unit Conductive Test Results */}
              {(testType === 'daily_check' || testType === 'golden_conductive' || testType === 'full_test') && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Golden Unit (Conductive) Test Results (Ω)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Test</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testData.golden_conductive_test}
                        onChange={(e) => setTestData({...testData, golden_conductive_test: e.target.value})}
                        className="input text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">1st Re-test</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testData.golden_conductive_first_retest}
                        onChange={(e) => setTestData({...testData, golden_conductive_first_retest: e.target.value})}
                        className="input text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">2nd Re-test</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testData.golden_conductive_second_retest}
                        onChange={(e) => setTestData({...testData, golden_conductive_second_retest: e.target.value})}
                        className="input text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Golden Unit Insulative Test Results */}
              {(testType === 'daily_check' || testType === 'golden_insulative' || testType === 'full_test') && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Golden Unit (Insulative) Test Results (Ω)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Test</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testData.golden_insulative_test}
                        onChange={(e) => setTestData({...testData, golden_insulative_test: e.target.value})}
                        className="input text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">1st Re-test</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testData.golden_insulative_first_retest}
                        onChange={(e) => setTestData({...testData, golden_insulative_first_retest: e.target.value})}
                        className="input text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">2nd Re-test</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testData.golden_insulative_second_retest}
                        onChange={(e) => setTestData({...testData, golden_insulative_second_retest: e.target.value})}
                        className="input text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {testMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    กำลังบันทึก...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                    </svg>
                    บันทึกข้อมูล
                  </>
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
              {latestTestsData?.length > 0 ? (
                latestTestsData.map((test) => (
                  <div key={test.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {test.equipment?.name || 'Unknown Equipment'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {test.cal_test ? parseFloat(test.cal_test).toFixed(2) : '0.00'} Ω
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
