import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentAPI, reportAPI } from '../services/api'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { 
  DocumentTextIcon, 
  PlusIcon, 
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [reportData, setReportData] = useState({
    notes: '',
    // Daily Check specific
    status: 'pending',
    // By-Off specific
    test_points: '',
    results: '',
    calibration_check: false,
    performance_check: false,
    safety_check: false,
    // IQA specific
    compliance_score: '',
    findings: '',
    recommendations: '',
    corrective_actions: '',
    next_inspection_date: '',
    standards_compliance: '',
    documentation_check: false,
    training_check: false,
    procedure_check: false
  })

  const queryClient = useQueryClient()

  // ข้อมูลจำลองเพื่อทดสอบ (ไม่ต้องดึงจาก backend)
  const mockEquipmentData = [
    { id: 1, name: 'Digital Multimeter FLUKE 87-V', model: 'FLUKE-87V' },
    { id: 2, name: 'Insulation Resistance Tester MEGGER', model: 'MIT-510' },
    { id: 3, name: 'Earth Ground Resistance Tester', model: 'FLUKE-1623' },
    { id: 4, name: 'Clamp Meter', model: 'FLUKE-376' }
  ]

  const mockReportsData = {
    daily: {
      reports: [
        {
          id: 1,
          equipment_id: 1,
          equipment_name: 'Digital Multimeter FLUKE 87-V',
          test_date: '2024-01-25T10:30:00Z',
          operator_name: 'John Doe',
          status: 'pass',
          notes: 'Test completed successfully'
        },
        {
          id: 2,
          equipment_id: 2,
          equipment_name: 'Insulation Resistance Tester MEGGER',
          test_date: '2024-01-25T09:15:00Z',
          operator_name: 'Jane Smith',
          status: 'pass',
          notes: 'All parameters within limits'
        }
      ]
    },
    byoff: {
      reports: [
        {
          id: 1,
          equipment_id: 1,
          equipment_name: 'Digital Multimeter FLUKE 87-V',
          test_date: '2024-01-25T10:30:00Z',
          operator_name: 'John Doe',
          status: 'pass',
          notes: 'BYOFF test completed'
        }
      ]
    },
    iqa: {
      reports: [
        {
          id: 1,
          equipment_id: 1,
          equipment_name: 'Digital Multimeter FLUKE 87-V',
          test_date: '2024-01-25T10:30:00Z',
          operator_name: 'John Doe',
          status: 'pass',
          notes: 'IQA inspection completed'
        }
      ]
    }
  }

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

  // ดึงข้อมูลรายงานตามประเภท (ปิดชั่วคราวเพื่อแก้ไขปัญหา refresh)
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports', activeTab],
    queryFn: () => {
      switch (activeTab) {
        case 'daily':
          return reportAPI.getDaily().then(res => res.data)
        case 'byoff':
          return reportAPI.getByOff().then(res => res.data)
        case 'iqa':
          return reportAPI.getIQA().then(res => res.data)
        default:
          return { reports: [] }
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: false, // ปิดชั่วคราว
  })

  // ใช้ข้อมูลจริงถ้ามี หรือใช้ข้อมูลจำลอง
  const equipment = equipmentData || mockEquipmentData
  const reports = reportsData || mockReportsData[activeTab] || { reports: [] }

  // สร้างรายงาน
  const createMutation = useMutation({
    mutationFn: (data) => {
      switch (activeTab) {
        case 'daily':
          return reportAPI.createDaily(data)
        case 'byoff':
          return reportAPI.createByOff(data)
        case 'iqa':
          return reportAPI.createIQA(data)
        default:
          return Promise.reject('Invalid report type')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('สร้างรายงานสำเร็จ')
      setShowCreateModal(false)
      resetForm()
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'สร้างรายงานไม่สำเร็จ')
    }
  })

  const resetForm = () => {
    setReportData({
      notes: '',
      status: 'pending',
      test_points: '',
      results: '',
      calibration_check: false,
      performance_check: false,
      safety_check: false,
      compliance_score: '',
      findings: '',
      recommendations: '',
      corrective_actions: '',
      next_inspection_date: '',
      standards_compliance: '',
      documentation_check: false,
      training_check: false,
      procedure_check: false
    })
    setSelectedEquipment('')
    setTestDate(new Date().toISOString().split('T')[0])
  }

  const handleCreateReport = () => {
    if (!selectedEquipment) {
      toast.error('กรุณาเลือกอุปกรณ์')
      return
    }

    const data = {
      equipment_id: parseInt(selectedEquipment),
      test_date: testDate,
      notes: reportData.notes
    }

    // เพิ่มข้อมูลเฉพาะตามประเภทรายงาน
    if (activeTab === 'daily') {
      data.status = reportData.status
    } else if (activeTab === 'byoff') {
      data.test_points = reportData.test_points ? JSON.parse(reportData.test_points) : null
      data.results = reportData.results ? JSON.parse(reportData.results) : null
      data.calibration_check = reportData.calibration_check
      data.performance_check = reportData.performance_check
      data.safety_check = reportData.safety_check
    } else if (activeTab === 'iqa') {
      data.compliance_score = reportData.compliance_score ? parseFloat(reportData.compliance_score) : null
      data.findings = reportData.findings
      data.recommendations = reportData.recommendations
      data.corrective_actions = reportData.corrective_actions
      data.next_inspection_date = reportData.next_inspection_date
      data.standards_compliance = reportData.standards_compliance ? JSON.parse(reportData.standards_compliance) : null
      data.documentation_check = reportData.documentation_check
      data.training_check = reportData.training_check
      data.procedure_check = reportData.procedure_check
    }

    createMutation.mutate(data)
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setShowViewModal(true)
  }

  const handleExportExcel = () => {
    try {
      // สร้างข้อมูลสำหรับ Excel ตามรูปแบบที่ต้องการ
      const excelData = reports?.reports?.map((report, index) => ({
        'ลำดับ': index + 1,
        'วันที่ทดสอบ': new Date(report.test_date).toLocaleDateString('th-TH'),
        'อุปกรณ์': getEquipmentName(report.equipment_id),
        'ผลการทดสอบ CAL': report.status === 'pass' ? 'ผ่าน' : report.status === 'fail' ? 'ไม่ผ่าน' : 'รอดำเนินการ',
        'สถานที่': '-', // สามารถเพิ่มฟิลด์ location ในข้อมูลได้
        'ผู้ดำเนินการ': report.operator_name || '-',
        'หมายเหตุ': report.notes || '-'
      })) || []

      // สร้าง workbook และ worksheet
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'บันทึกผลการทดสอบ')

      // ตั้งค่าความกว้างคอลัมน์
      const colWidths = [
        { wch: 8 },   // ลำดับ
        { wch: 15 },  // วันที่ทดสอบ
        { wch: 30 },  // อุปกรณ์
        { wch: 15 },  // ผลการทดสอบ CAL
        { wch: 20 },  // สถานที่
        { wch: 20 },  // ผู้ดำเนินการ
        { wch: 30 }   // หมายเหตุ
      ]
      ws['!cols'] = colWidths

      // สร้างชื่อไฟล์ตามวันที่ปัจจุบัน
      const today = new Date().toLocaleDateString('th-TH').replace(/\//g, '-')
      const fileName = `บันทึกผลการทดสอบ_${today}.xlsx`

      // ส่งออกไฟล์
      XLSX.writeFile(wb, fileName)
      toast.success('ส่งออก Excel สำเร็จ')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('ส่งออก Excel ไม่สำเร็จ')
    }
  }

  const getStatusBadge = (status, type = 'default') => {
    const statusConfig = {
      default: {
        pass: { color: 'badge-success', text: 'ผ่าน' },
        fail: { color: 'badge-error', text: 'ไม่ผ่าน' },
        pending: { color: 'badge-warning', text: 'รอดำเนินการ' }
      },
      iqa: {
        approved: { color: 'badge-success', text: 'อนุมัติ' },
        rejected: { color: 'badge-error', text: 'ปฏิเสธ' },
        pending: { color: 'badge-warning', text: 'รอดำเนินการ' }
      }
    }
    
    const config = statusConfig[type] || statusConfig.default
    const statusInfo = config[status] || config.pending
    return <span className={`badge ${statusInfo.color}`}>{statusInfo.text}</span>
  }

  const getEquipmentName = (id) => {
    const equipmentItem = equipment?.find(eq => eq.id === id)
    return equipmentItem?.name || 'ไม่พบอุปกรณ์'
  }

  const tabs = [
    { id: 'daily', name: 'รายงานประจำวัน', icon: CalendarIcon },
    { id: 'byoff', name: 'รายงาน By-Off', icon: DocumentTextIcon },
    { id: 'iqa', name: 'รายงาน IQA', icon: DocumentTextIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายงาน</h1>
          <p className="text-gray-600">จัดการและสร้างรายงานการทดสอบ</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportExcel}
            className="btn-outline flex items-center"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            ส่งออก Excel
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            สร้างรายงาน
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Reports List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>อุปกรณ์</th>
                <th>วันที่ทดสอบ</th>
                <th>สถานะ</th>
                <th>ผู้ดำเนินการ</th>
                <th>วันที่สร้าง</th>
                <th className="text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="loading-spinner mx-auto" />
                  </td>
                </tr>
              ) : reports?.reports?.length > 0 ? (
                reports.reports.map((report) => (
                  <tr key={report.id}>
                    <td className="font-medium">{getEquipmentName(report.equipment_id)}</td>
                    <td>{new Date(report.test_date).toLocaleDateString('th-TH')}</td>
                    <td>
                      {getStatusBadge(report.status, activeTab === 'iqa' ? 'iqa' : 'default')}
                    </td>
                    <td>
                      {report.operator_name || '-'}
                    </td>
                    <td>{new Date(report.test_date).toLocaleString('th-TH')}</td>
                    <td className="text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="ดูรายละเอียด"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="ดาวน์โหลด"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    ไม่พบข้อมูลรายงาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                สร้าง{tabs.find(t => t.id === activeTab)?.name}
              </h2>
              
              <form onSubmit={(e) => { e.preventDefault(); handleCreateReport(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อุปกรณ์ *
                    </label>
                    <select
                      value={selectedEquipment}
                      onChange={(e) => setSelectedEquipment(e.target.value)}
                      className="input"
                      required
                    >
                      <option value="">-- เลือกอุปกรณ์ --</option>
                      {equipmentData?.equipment?.map((equipment) => (
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
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                </div>

                {/* Fields specific to report type */}
                {activeTab === 'daily' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สถานะ
                    </label>
                    <select
                      value={reportData.status}
                      onChange={(e) => setReportData({...reportData, status: e.target.value})}
                      className="input"
                    >
                      <option value="pending">รอดำเนินการ</option>
                      <option value="pass">ผ่าน</option>
                      <option value="fail">ไม่ผ่าน</option>
                    </select>
                  </div>
                )}

                {activeTab === 'byoff' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={reportData.calibration_check}
                          onChange={(e) => setReportData({...reportData, calibration_check: e.target.checked})}
                          className="mr-2"
                        />
                        ตรวจสอบการสอบเทียบ
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={reportData.performance_check}
                          onChange={(e) => setReportData({...reportData, performance_check: e.target.checked})}
                          className="mr-2"
                        />
                        ตรวจสอบประสิทธิภาพ
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={reportData.safety_check}
                          onChange={(e) => setReportData({...reportData, safety_check: e.target.checked})}
                          className="mr-2"
                        />
                        ตรวจสอบความปลอดภัย
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'iqa' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        คะแนนความสอดคล้อง
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={reportData.compliance_score}
                        onChange={(e) => setReportData({...reportData, compliance_score: e.target.value})}
                        className="input"
                        placeholder="85.50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ข้อค้นพบ
                      </label>
                      <textarea
                        rows={2}
                        value={reportData.findings}
                        onChange={(e) => setReportData({...reportData, findings: e.target.value})}
                        className="input"
                        placeholder="บันทึกข้อค้นพบ..."
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หมายเหตุ
                  </label>
                  <textarea
                    rows={3}
                    value={reportData.notes}
                    onChange={(e) => setReportData({...reportData, notes: e.target.value})}
                    className="input"
                    placeholder="บันทึกหมายเหตุเพิ่มเติม..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                    className="btn-outline"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="btn-primary"
                  >
                    {createMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="loading-spinner mr-2" />
                        กำลังสร้าง...
                      </div>
                    ) : (
                      'สร้างรายงาน'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {tabs.find(t => t.id === activeTab)?.name}
                  </h2>
                  <h3 className="text-lg text-gray-700">
                    {getEquipmentName(selectedReport.equipment_id)}
                  </h3>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">วันที่ทดสอบ</label>
                    <p className="text-gray-900">{new Date(selectedReport.test_date).toLocaleString('th-TH')}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">ผู้ดำเนินการ</label>
                    <p className="text-gray-900">{selectedReport.operator_name || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">สถานะ</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedReport.status, activeTab === 'iqa' ? 'iqa' : 'default')}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">รหัสรายงาน</label>
                    <p className="text-gray-900">#{selectedReport.id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">ประเภทรายงาน</label>
                    <p className="text-gray-900">{tabs.find(t => t.id === activeTab)?.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">วันที่สร้าง</label>
                    <p className="text-gray-900">{new Date(selectedReport.test_date).toLocaleString('th-TH')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">หมายเหตุ</label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {selectedReport.notes || 'ไม่มีหมายเหตุ'}
                  </p>
                </div>
              </div>

              {/* Additional fields based on report type */}
              {activeTab === 'byoff' && selectedReport.calibration_check !== undefined && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">การตรวจสอบ By-Off</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedReport.calibration_check || false}
                        className="mr-2"
                        disabled
                      />
                      <label className="text-sm text-gray-700">ตรวจสอบการสอบเทียบ</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedReport.performance_check || false}
                        className="mr-2"
                        disabled
                      />
                      <label className="text-sm text-gray-700">ตรวจสอบประสิทธิภาพ</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedReport.safety_check || false}
                        className="mr-2"
                        disabled
                      />
                      <label className="text-sm text-gray-700">ตรวจสอบความปลอดภัย</label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'iqa' && selectedReport.compliance_score !== undefined && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลการตรวจสอบ IQA</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">คะแนนความสอดคล้อง</label>
                      <p className="text-gray-900">{selectedReport.compliance_score || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">วันที่ตรวจครั้งถัดไป</label>
                      <p className="text-gray-900">
                        {selectedReport.next_inspection_date ? 
                          new Date(selectedReport.next_inspection_date).toLocaleDateString('th-TH') : 
                          '-'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {selectedReport.findings && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">ข้อค้นพบ</label>
                      <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedReport.findings}</p>
                    </div>
                  )}
                  
                  {selectedReport.recommendations && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">คำแนะนำ</label>
                      <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedReport.recommendations}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-outline"
                >
                  ปิด
                </button>
                <button
                  className="btn-primary flex items-center"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  ดาวน์โหลด PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
