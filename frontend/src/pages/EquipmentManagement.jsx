import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const EquipmentManagement = () => {
  const { user, isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serial_number: '',
    calibration_date: '',
    status: 'active',
    location: '',
    description: ''
  })

  const queryClient = useQueryClient()

  // ดึงข้อมูลอุปกรณ์
  const { data: equipmentData, isLoading } = useQuery({
    queryKey: ['equipment', searchTerm, statusFilter],
    queryFn: () => equipmentAPI.getAll({
      search: searchTerm,
      status: statusFilter
    }).then(res => res.data)
  })

  // สร้างอุปกรณ์ใหม่
  const createMutation = useMutation({
    mutationFn: equipmentAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('เพิ่มอุปกรณ์สำเร็จ')
      setShowAddModal(false)
      resetForm()
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'เพิ่มอุปกรณ์ไม่สำเร็จ')
    }
  })

  // แก้ไขอุปกรณ์
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => equipmentAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('แก้ไขอุปกรณ์สำเร็จ')
      setEditingEquipment(null)
      resetForm()
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'แก้ไขอุปกรณ์ไม่สำเร็จ')
    }
  })

  // ลบอุปกรณ์
  const deleteMutation = useMutation({
    mutationFn: equipmentAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('ลบอุปกรณ์สำเร็จ')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'ลบอุปกรณ์ไม่สำเร็จ')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      serial_number: '',
      calibration_date: '',
      status: 'active',
      location: '',
      description: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingEquipment) {
      updateMutation.mutate({ id: editingEquipment.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (equipment) => {
    setEditingEquipment(equipment)
    setFormData({
      name: equipment.name,
      model: equipment.model || '',
      serial_number: equipment.serial_number || '',
      calibration_date: equipment.calibration_date || '',
      status: equipment.status,
      location: equipment.location || '',
      description: equipment.description || ''
    })
  }

  const handleDelete = (equipment) => {
    if (window.confirm(`คุณต้องการลบอุปกรณ์ "${equipment.name}" ใช่หรือไม่?`)) {
      deleteMutation.mutate(equipment.id)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'badge-success', text: 'ใช้งาน' },
      maintenance: { color: 'badge-warning', text: 'ซ่อมบำรุง' },
      retired: { color: 'badge-error', text: 'เลิกใช้งาน' }
    }
    
    const config = statusConfig[status] || statusConfig.active
    return <span className={`badge ${config.color}`}>{config.text}</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการอุปกรณ์</h1>
          <p className="text-gray-600">จัดการข้อมูลเครื่องวัดค่าความต้านทาน</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
          disabled={!isAdmin}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          เพิ่มอุปกรณ์
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รุ่น, หรือหมายเลขซีเรียล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">ทุกสถานะ</option>
              <option value="active">ใช้งาน</option>
              <option value="maintenance">ซ่อมบำรุง</option>
              <option value="retired">เลิกใช้งาน</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ชื่ออุปกรณ์</th>
                <th>รุ่น</th>
                <th>หมายเลขซีเรียล</th>
                <th>วันที่สอบเทียบ</th>
                <th>สถานะ</th>
                <th>สถานที่</th>
                <th className="text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="loading-spinner mx-auto" />
                  </td>
                </tr>
              ) : equipmentData?.equipment?.length > 0 ? (
                equipmentData.equipment.map((equipment) => (
                  <tr key={equipment.id}>
                    <td className="font-medium">{equipment.name}</td>
                    <td>{equipment.model || '-'}</td>
                    <td>{equipment.serial_number || '-'}</td>
                    <td>
                      {equipment.calibration_date 
                        ? new Date(equipment.calibration_date).toLocaleDateString('th-TH')
                        : '-'
                      }
                    </td>
                    <td>{getStatusBadge(equipment.status)}</td>
                    <td>{equipment.location || '-'}</td>
                    <td className="text-right">
                      <div className="flex justify-end space-x-2">
                        {isAdmin && (
                          <button
                            onClick={() => handleEdit(equipment)}
                            className="p-1 text-gray-400 hover:text-primary-600"
                            title="แก้ไข"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(equipment)}
                            className="p-1 text-gray-400 hover:text-error-600"
                            title="ลบ"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    ไม่พบข้อมูลอุปกรณ์
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingEquipment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEquipment ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingEquipment(null)
                  resetForm()
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่ออุปกรณ์ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                      สถานะ
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="input"
                    >
                      <option value="active">ใช้งาน</option>
                      <option value="maintenance">ซ่อมบำรุง</option>
                      <option value="retired">เลิกใช้งาน</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สถานที่
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียด
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingEquipment(null)
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
                        {editingEquipment ? 'กำลังแก้ไข...' : 'กำลังเพิ่ม...'}
                      </div>
                    ) : (
                      editingEquipment ? 'แก้ไข' : 'เพิ่ม'
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

export default EquipmentManagement
