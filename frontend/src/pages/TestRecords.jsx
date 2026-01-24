import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentAPI, testRecordsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  BeakerIcon,
  DocumentArrowDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const TestRecords = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [formData, setFormData] = useState({
    equipment_id: '',
    test_date: new Date().toISOString().split('T')[0],
    brand: '',
    model: '',
    serial_number: '',
    calibration_date: '',
    due_date: '',
    temperature: '',
    humidity: '',
    cal_test: '',
    cal_first_retest: '',
    cal_second_retest: '',
    golden_conductive_test: '',
    golden_conductive_first_retest: '',
    golden_conductive_second_retest: '',
    golden_insulative_test: '',
    golden_insulative_first_retest: '',
    golden_insulative_second_retest: '',
    test_location: 'CAL Lab'
  })

  const queryClient = useQueryClient()

  // ข้อมูลจำลองเพื่อทดสอบ (ไม่ต้องดึงจาก backend)
  const mockEquipmentData = [
    { id: 1, name: 'Digital Multimeter FLUKE 87-V', model: 'FLUKE-87V' },
    { id: 2, name: 'Insulation Resistance Tester MEGGER', model: 'MIT-510' },
    { id: 3, name: 'Earth Ground Resistance Tester', model: 'FLUKE-1623' },
    { id: 4, name: 'Clamp Meter', model: 'FLUKE-376' }
  ]

  const mockTestRecordsData = [
    {
      id: 1,
      equipment_id: 1,
      equipment_name: 'Digital Multimeter FLUKE 87-V',
      test_date: '2024-01-25T10:30:00Z',
      operator_name: 'John Doe',
      golden_conductive_test: 1000.5,
      golden_conductive_first_retest: 1001.2,
      golden_conductive_second_retest: 999.8,
      golden_insulative_test: 50000.0,
      golden_insulative_first_retest: 50100.0,
      golden_insulative_second_retest: 49900.0,
      test_location: 'CAL Lab',
      status: 'pass'
    },
    {
      id: 2,
      equipment_id: 2,
      equipment_name: 'Insulation Resistance Tester MEGGER',
      test_date: '2024-01-25T09:15:00Z',
      operator_name: 'Jane Smith',
      golden_conductive_test: 1500.2,
      golden_conductive_first_retest: 1499.8,
      golden_conductive_second_retest: 1500.5,
      golden_insulative_test: 60000.0,
      golden_insulative_first_retest: 60100.0,
      golden_insulative_second_retest: 59900.0,
      test_location: 'CAL Lab',
      status: 'pass'
    }
  ]

  // ดึงข้อมูลอุปกรณ์ทั้งหมด (ปิดชั่วคราวเพื่อแก้ไขปัญหา refresh)
  const { data: equipmentData } = useQuery({
    queryKey: ['equipment-all'],
    queryFn: () => equipmentAPI.getAll().then(res => res.data),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: false, // ปิดชั่วคราว
  })

  // ดึงข้อมูลบันทึกการทดสอบ (ปิดชั่วคราวเพื่อแก้ไขปัญหา refresh)
  const { data: testRecordsData, isLoading } = useQuery({
    queryKey: ['test-records', searchTerm, dateFilter],
    queryFn: () => testRecordsAPI.getAll({
      search: searchTerm,
      date: dateFilter
    }).then(res => res.data),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: false, // ปิดชั่วคราว
  })

  // ใช้ข้อมูลจริงถ้ามี หรือใช้ข้อมูลจำลอง
  const equipment = equipmentData || mockEquipmentData
  const testRecords = testRecordsData || mockTestRecordsData

  // สร้างบันทึกการทดสอบใหม่
  const createMutation = useMutation({
    mutationFn: testRecordsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-records'] })
      toast.success('บันทึกผลการทดสอบสำเร็จ')
      setShowAddModal(false)
      resetForm()
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'บันทึกผลการทดสอบไม่สำเร็จ')
    }
  })

  // แก้ไขบันทึกการทดสอบ
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => testRecordsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-records'] })
      toast.success('แก้ไขบันทึกผลการทดสอบสำเร็จ')
      setEditingRecord(null)
      resetForm()
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'แก้ไขบันทึกผลการทดสอบไม่สำเร็จ')
    }
  })

  // ลบบันทึกการทดสอบ
  const deleteMutation = useMutation({
    mutationFn: testRecordsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-records'] })
      toast.success('ลบบันทึกผลการทดสอบสำเร็จ')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'ลบบันทึกผลการทดสอบไม่สำเร็จ')
    }
  })

  const resetForm = () => {
    setFormData({
      equipment_id: '',
      test_date: new Date().toISOString().split('T')[0],
      brand: '',
      model: '',
      serial_number: '',
      calibration_date: '',
      due_date: '',
      temperature: '',
      humidity: '',
      cal_test: '',
      cal_first_retest: '',
      cal_second_retest: '',
      golden_conductive_test: '',
      golden_conductive_first_retest: '',
      golden_conductive_second_retest: '',
      golden_insulative_test: '',
      golden_insulative_first_retest: '',
      golden_insulative_second_retest: '',
      test_location: 'CAL Lab'
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const data = {
      ...formData,
      operator_id: user.id
    }

    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setFormData({
      equipment_id: record.equipment_id.toString(),
      test_date: record.test_date,
      brand: record.brand || '',
      model: record.model || '',
      serial_number: record.serial_number || '',
      calibration_date: record.calibration_date || '',
      due_date: record.due_date || '',
      temperature: record.temperature || '',
      humidity: record.humidity || '',
      cal_test: record.cal_test || '',
      cal_first_retest: record.cal_first_retest || '',
      cal_second_retest: record.cal_second_retest || '',
      golden_conductive_test: record.golden_conductive_test || '',
      golden_conductive_first_retest: record.golden_conductive_first_retest || '',
      golden_conductive_second_retest: record.golden_conductive_second_retest || '',
      golden_insulative_test: record.golden_insulative_test || '',
      golden_insulative_first_retest: record.golden_insulative_first_retest || '',
      golden_insulative_second_retest: record.golden_insulative_second_retest || '',
      test_location: record.test_location || 'CAL Lab'
    })
  }

  const handleDelete = (record) => {
    if (window.confirm(`คุณต้องการลบบันทึกการทดสอบวันที่ ${new Date(record.test_date).toLocaleDateString('th-TH')} ใช่หรือไม่?`)) {
      deleteMutation.mutate(record.id)
    }
  }

  const getEquipmentName = (id) => {
    const equipmentItem = equipment?.find(eq => eq.id === id)
    return equipmentItem?.name || 'ไม่พบอุปกรณ์'
  }

  const handleExportExcel = () => {
    // TODO: Implement Excel export functionality
    toast.info('ฟังก์ชันส่งออก Excel จะเพิ่มในภายหลัง')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">บันทึกผลการทดสอบ</h1>
          <p className="text-gray-600">บันทึกผลการทดสอบการสอบเทียบเครื่องวัดค่าความต้านทาน</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportExcel}
            className="btn-outline flex items-center"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            ส่งออก Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            บันทึกผลการทดสอบ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่ออุปกรณ์, รุ่น, หรือหมายเลขซีเรียล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input"
              placeholder="กรองตามวันที่"
            />
          </div>
        </div>
      </div>

      {/* Test Records List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>วันที่ทดสอบ</th>
                <th>อุปกรณ์</th>
                <th>รุ่น</th>
                <th>หมายเลขซีเรียล</th>
                <th>ผลการทดสอบ CAL</th>
                <th>สถานที่</th>
                <th>ผู้ดำเนินการ</th>
                <th className="text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="loading-spinner mx-auto" />
                  </td>
                </tr>
              ) : testRecords?.length > 0 ? (
                testRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.test_date).toLocaleDateString('th-TH')}</td>
                    <td className="font-medium">{getEquipmentName(record.equipment_id)}</td>
                    <td>{record.model || '-'}</td>
                    <td>{record.serial_number || '-'}</td>
                    <td>
                      <div className="text-sm">
                        <div>Test: {record.cal_test || '-'}</div>
                        <div>1st: {record.cal_first_retest || '-'}</div>
                        <div>2nd: {record.cal_second_retest || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${record.test_location === 'CAL Lab' ? 'badge-info' : 'badge-warning'}`}>
                        {record.test_location}
                      </span>
                    </td>
                    <td>{record.operator?.full_name || '-'}</td>
                    <td className="text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="แก้ไข"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record)}
                          className="p-1 text-gray-400 hover:text-error-600"
                          title="ลบ"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    ไม่พบข้อมูลบันทึกการทดสอบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingRecord) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingRecord ? 'แก้ไขบันทึกผลการทดสอบ' : 'บันทึกผลการทดสอบใหม่'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingRecord(null)
                    resetForm()
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Equipment Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">ข้อมูลอุปกรณ์</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        อุปกรณ์ *
                      </label>
                      <select
                        value={formData.equipment_id}
                        onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}
                        className="input"
                        required
                      >
                        <option value="">-- เลือกอุปกรณ์ --</option>
                        {equipment?.map((equipment) => (
                          <option key={equipment.id} value={equipment.id}>
                            {equipment.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        วันที่ทดสอบ *
                      </label>
                      <input
                        type="date"
                        value={formData.test_date}
                        onChange={(e) => setFormData({...formData, test_date: e.target.value})}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ยี่ห้อ
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className="input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        รุ่น
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        className="input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        หมายเลขซีเรียล
                      </label>
                      <input
                        type="text"
                        value={formData.serial_number}
                        onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                        className="input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        วันที่สอบเทียบ
                      </label>
                      <input
                        type="date"
                        value={formData.calibration_date}
                        onChange={(e) => setFormData({...formData, calibration_date: e.target.value})}
                        className="input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        วันที่ครบกำหนด
                      </label>
                      <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        อุณหภูมิ (°C)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.temperature}
                        onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                        className="input"
                        placeholder="25.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ความชื้น (%RH)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.humidity}
                        onChange={(e) => setFormData({...formData, humidity: e.target.value})}
                        className="input"
                        placeholder="50.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        สถานที่ทดสอบ *
                      </label>
                      <select
                        value={formData.test_location}
                        onChange={(e) => setFormData({...formData, test_location: e.target.value})}
                        className="input"
                        required
                      >
                        <option value="CAL Lab">CAL Lab</option>
                        <option value="Field">Field</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* CAL Test Results */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">ผลการทดสอบ CAL (Ω)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cal_test}
                        onChange={(e) => setFormData({...formData, cal_test: e.target.value})}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        1st Re-test
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cal_first_retest}
                        onChange={(e) => setFormData({...formData, cal_first_retest: e.target.value})}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        2nd Re-test
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cal_second_retest}
                        onChange={(e) => setFormData({...formData, cal_second_retest: e.target.value})}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Golden Unit Conductive Test Results */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Golden Unit (Conductive) Test Results (Ω)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.golden_conductive_test}
                        onChange={(e) => setFormData({...formData, golden_conductive_test: e.target.value})}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        1st Re-test
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.golden_conductive_first_retest}
                        onChange={(e) => setFormData({...formData, golden_conductive_first_retest: e.target.value})}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        2nd Re-test
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.golden_conductive_second_retest}
                        onChange={(e) => setFormData({...formData, golden_conductive_second_retest: e.target.value})}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Golden Unit Insulative Test Results */}
                <div className="pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Golden Unit (Insulative) Test Results (Ω)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.golden_insulative_test}
                        onChange={(e) => setFormData({...formData, golden_insulative_test: e.target.value})}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        1st Re-test
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.golden_insulative_first_retest}
                        onChange={(e) => setFormData({...formData, golden_insulative_first_retest: e.target.value})}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        2nd Re-test
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.golden_insulative_second_retest}
                        onChange={(e) => setFormData({...formData, golden_insulative_second_retest: e.target.value})}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingRecord(null)
                      resetForm()
                    }}
                    className="btn-outline"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn-primary"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="loading-spinner mr-2" />
                        {editingRecord ? 'กำลังแก้ไข...' : 'กำลังบันทึก...'}
                      </div>
                    ) : (
                      editingRecord ? 'แก้ไข' : 'บันทึก'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestRecords
