import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentAPI, reportAPI } from '../services/api'
import toast from 'react-hot-toast'
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

  // ดึงข้อมูลอุปกรณ์ทั้งหมด
  const { data: equipmentData } = useQuery({
    queryKey: ['equipment-all'],
    queryFn: () => equipmentAPI.getAll().then(res => res.data)
  })

  // ดึงข้อมูลรายงานตามประเภท
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
    }
  })

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
    const equipment = equipmentData?.equipment?.find(eq => eq.id === id)
    return equipment?.name || 'ไม่พบอุปกรณ์'
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          สร้างรายงาน
        </button>
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
              ) : reportsData?.reports?.length > 0 ? (
                reportsData.reports.map((report) => (
                  <tr key={report.id}>
                    <td className="font-medium">{getEquipmentName(report.equipment_id)}</td>
                    <td>{new Date(report.test_date).toLocaleDateString('th-TH')}</td>
                    <td>
                      {getStatusBadge(report.status, activeTab === 'iqa' ? 'iqa' : 'default')}
                    </td>
                    <td>
                      {report.operator?.full_name || '-'}
                    </td>
                    <td>{new Date(report.created_at).toLocaleString('th-TH')}</td>
                    <td className="text-right">
                      <div className="flex justify-end space-x-2">
                        <button
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
    </div>
  )
}

export default Reports
