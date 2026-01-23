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

  const handleStartTest = () => {
    if (!selectedEquipment) {
      toast.error('กรุณาเลือกอุปกรณ์')
      return
    }
    
    setIsTesting(true)
    // จำลองการทดสอบแบบเรียลไทม์
    simulateTest()
  }

  const handleStopTest = () => {
    setIsTesting(false)
    setCurrentValue(0)
  }

  const simulateTest = () => {
    if (!isTesting) return
    
    // จำลองค่าความต้านทานสุ่ม
    const newValue = (Math.random() * 100 + 50).toFixed(2)
    setCurrentValue(newValue)
    
    // เพิ่มลงประวัติ
    const newRecord = {
      id: Date.now(),
      value: parseFloat(newValue),
      timestamp: new Date()
    }
    setTestHistory(prev => [newRecord, ...prev].slice(0, 10))
    
    // ทดสอบต่อเนื่อง
    setTimeout(simulateTest, 1000)
  }

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
                  ) : (
                    <span className="text-sm text-gray-500">พร้อมทดสอบ</span>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleStartTest}
                  disabled={isTesting || !selectedEquipment}
                  className={`flex-1 btn-success ${isTesting || !selectedEquipment ? 'opacity-50 cursor-not-allowed' : ''}`}
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
