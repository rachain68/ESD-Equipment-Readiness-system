import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentAPI, testRecordsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
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
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [viewingRecord, setViewingRecord] = useState(null)
  const [formData, setFormData] = useState({
    test_type: 'daily_check',
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
      brand: 'FLUKE',
      model: 'FLUKE-87V',
      serial_number: 'SN001234',
      calibration_date: '2024-01-20',
      due_date: '2025-01-20',
      temperature: '25.0',
      humidity: '45.0',
      cal_test: '1.02',
      cal_first_retest: '1.01',
      cal_second_retest: '1.03',
      golden_conductive_test: '1000.5',
      golden_conductive_first_retest: '1001.2',
      golden_conductive_second_retest: '999.8',
      golden_insulative_test: '50000.0',
      golden_insulative_first_retest: '50100.0',
      golden_insulative_second_retest: '49900.0',
      test_location: 'CAL Lab',
      status: 'pass'
    },
    {
      id: 2,
      equipment_id: 2,
      equipment_name: 'Insulation Resistance Tester MEGGER',
      test_date: '2024-01-25T09:15:00Z',
      operator_name: 'Jane Smith',
      brand: 'MEGGER',
      model: 'MIT-510',
      serial_number: 'SN005678',
      calibration_date: '2024-01-18',
      due_date: '2025-01-18',
      temperature: '24.5',
      humidity: '50.0',
      cal_test: '1.00',
      cal_first_retest: '1.01',
      cal_second_retest: '0.99',
      golden_conductive_test: '1500.2',
      golden_conductive_first_retest: '1499.8',
      golden_conductive_second_retest: '1500.5',
      golden_insulative_test: '60000.0',
      golden_insulative_first_retest: '60100.0',
      golden_insulative_second_retest: '59900.0',
      test_location: 'CAL Lab',
      status: 'pass'
    },
    {
      id: 3,
      equipment_id: 1,
      equipment_name: 'Digital Multimeter FLUKE 87-V',
      test_date: '2024-01-24T14:20:00Z',
      operator_name: 'Tom Wilson',
      brand: 'FLUKE',
      model: 'FLUKE-87V',
      serial_number: 'SN001235',
      calibration_date: '2024-01-19',
      due_date: '2025-01-19',
      temperature: '23.8',
      humidity: '48.0',
      cal_test: '1.02',
      cal_first_retest: '1.02',
      cal_second_retest: '1.01',
      golden_conductive_test: '998.5',
      golden_conductive_first_retest: '999.0',
      golden_conductive_second_retest: '998.0',
      golden_insulative_test: '49500.0',
      golden_insulative_first_retest: '49600.0',
      golden_insulative_second_retest: '49400.0',
      test_location: 'CAL Lab',
      status: 'pass'
    },
    {
      id: 4,
      equipment_id: 3,
      equipment_name: 'Earth Ground Resistance Tester',
      test_date: '2024-01-23T11:45:00Z',
      operator_name: 'Sarah Johnson',
      brand: 'FLUKE',
      model: 'FLUKE-1623',
      serial_number: 'SN009012',
      calibration_date: '2024-01-17',
      due_date: '2025-01-17',
      temperature: '26.2',
      humidity: '42.0',
      cal_test: '0.98',
      cal_first_retest: '0.99',
      cal_second_retest: '0.97',
      golden_conductive_test: '2000.0',
      golden_conductive_first_retest: '2001.5',
      golden_conductive_second_retest: '1998.5',
      golden_insulative_test: '70000.0',
      golden_insulative_first_retest: '70100.0',
      golden_insulative_second_retest: '69900.0',
      test_location: 'CAL Lab',
      status: 'pass'
    },
    {
      id: 5,
      equipment_id: 4,
      equipment_name: 'Clamp Meter',
      test_date: '2024-01-22T16:30:00Z',
      operator_name: 'Mike Brown',
      brand: 'FLUKE',
      model: 'FLUKE-376',
      serial_number: 'SN013456',
      calibration_date: '2024-01-16',
      due_date: '2025-01-16',
      temperature: '25.5',
      humidity: '46.0',
      cal_test: '1.01',
      cal_first_retest: '1.00',
      cal_second_retest: '1.02',
      golden_conductive_test: '1200.8',
      golden_conductive_first_retest: '1201.2',
      golden_conductive_second_retest: '1200.4',
      golden_insulative_test: '55000.0',
      golden_insulative_first_retest: '55100.0',
      golden_insulative_second_retest: '54900.0',
      test_location: 'CAL Lab',
      status: 'pass'
    },
    {
      id: 6,
      equipment_id: 2,
      equipment_name: 'Insulation Resistance Tester MEGGER',
      test_date: '2024-01-21T13:15:00Z',
      operator_name: 'Lisa Davis',
      brand: 'MEGGER',
      model: 'MIT-510',
      serial_number: 'SN005679',
      calibration_date: '2024-01-15',
      due_date: '2025-01-15',
      temperature: '24.0',
      humidity: '52.0',
      cal_test: '1.03',
      cal_first_retest: '1.02',
      cal_second_retest: '1.04',
      golden_conductive_test: '1450.0',
      golden_conductive_first_retest: '1450.5',
      golden_conductive_second_retest: '1449.5',
      golden_insulative_test: '58000.0',
      golden_insulative_first_retest: '58100.0',
      golden_insulative_second_retest: '57900.0',
      test_location: 'CAL Lab',
      status: 'pass'
    },
    {
      id: 7,
      equipment_id: 1,
      equipment_name: 'Digital Multimeter FLUKE 87-V',
      test_date: '2024-01-20T10:00:00Z',
      operator_name: 'David Lee',
      brand: 'FLUKE',
      model: 'FLUKE-87V',
      serial_number: 'SN001236',
      calibration_date: '2024-01-14',
      due_date: '2025-01-14',
      temperature: '25.8',
      humidity: '44.0',
      cal_test: '1.00',
      cal_first_retest: '1.01',
      cal_second_retest: '0.99',
      golden_conductive_test: '1005.0',
      golden_conductive_first_retest: '1005.5',
      golden_conductive_second_retest: '1004.5',
      golden_insulative_test: '50200.0',
      golden_insulative_first_retest: '50300.0',
      golden_insulative_second_retest: '50100.0',
      test_location: 'CAL Lab',
      status: 'pass'
    },
    {
      id: 8,
      equipment_id: 3,
      equipment_name: 'Earth Ground Resistance Tester',
      test_date: '2024-01-19T15:30:00Z',
      operator_name: 'Emma White',
      brand: 'FLUKE',
      model: 'FLUKE-1623',
      serial_number: 'SN009013',
      calibration_date: '2024-01-13',
      due_date: '2025-01-13',
      temperature: '23.5',
      humidity: '49.0',
      cal_test: '0.99',
      cal_first_retest: '0.98',
      cal_second_retest: '1.00',
      golden_conductive_test: '1995.0',
      golden_conductive_first_retest: '1996.0',
      golden_conductive_second_retest: '1994.0',
      golden_insulative_test: '69500.0',
      golden_insulative_first_retest: '69600.0',
      golden_insulative_second_retest: '69400.0',
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

  // กรองข้อมูลตามการค้นหาและวันที่
  const filteredTestRecords = testRecords?.filter(record => {
    const matchesSearch = !searchTerm || 
      getEquipmentName(record.equipment_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.model && record.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.serial_number && record.serial_number.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesDate = !dateFilter || record.test_date === dateFilter
    
    return matchesSearch && matchesDate
  }) || []

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
      test_type: 'daily_check',
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
      test_type: record.test_type || 'daily_check',
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

  const handleView = (record) => {
    setViewingRecord(record)
    setShowViewModal(true)
  }

  const getEquipmentName = (id) => {
    const equipmentItem = equipment?.find(eq => eq.id === id)
    return equipmentItem?.name || 'ไม่พบอุปกรณ์'
  }

  const handleExportExcel = async () => {
    try {
      // กรองข้อมูลตามการค้นหาและวันที่
      let filteredData = testRecords || []
      
      if (searchTerm) {
        filteredData = filteredData.filter(record => 
          getEquipmentName(record.equipment_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.model && record.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (record.serial_number && record.serial_number.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      
      if (dateFilter) {
        filteredData = filteredData.filter(record => 
          record.test_date === dateFilter
        )
      }

      // โหลดไฟล์ Template จาก docs folder
      const templateResponse = await fetch('/docs/007-000-000215-Form.1-Rev.C.xlsx')
      if (!templateResponse.ok) {
        throw new Error('ไม่พบไฟล์ template')
      }
      const arrayBuffer = await templateResponse.arrayBuffer()
      const wb = XLSX.read(arrayBuffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]] // เลือก sheet แรก

      // กำหนดแถวเริ่มต้นสำหรับข้อมูลใน Template (จากรูปภาพคือแถว 21)
      const startRow = 21

      // เขียนข้อมูลลงใน Template ตามคอลัมน์ที่กำหนด
      filteredData.forEach((record, index) => {
        const currentRow = startRow + index
        
        // Date (คอลัมน์ A)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 0 })] = { 
          v: new Date(record.test_date).toLocaleDateString('th-TH'), 
          t: 's' 
        }
        
        // Equipment name (คอลัมน์ B)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 1 })] = { 
          v: getEquipmentName(record.equipment_id), 
          t: 's' 
        }
        
        // Brand (คอลัมน์ C)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 2 })] = { 
          v: record.brand || '-', 
          t: 's' 
        }
        
        // Model (คอลัมน์ D)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 3 })] = { 
          v: record.model || '-', 
          t: 's' 
        }
        
        // Serial no. (คอลัมน์ E)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 4 })] = { 
          v: record.serial_number || '-', 
          t: 's' 
        }
        
        // CAL date (คอลัมน์ F)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 5 })] = { 
          v: record.calibration_date || '-', 
          t: 's' 
        }
        
        // Due date (คอลัมน์ G)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 6 })] = { 
          v: record.due_date || '-', 
          t: 's' 
        }
        
        // Environment - Temp (คอลัมน์ H)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 7 })] = { 
          v: record.temperature || '-', 
          t: 's' 
        }
        
        // Environment - Humidity (คอลัมน์ I)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 8 })] = { 
          v: record.humidity || '-', 
          t: 's' 
        }
        
        // CAL - Test (คอลัมน์ J)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 9 })] = { 
          v: record.cal_test || '-', 
          t: 's' 
        }
        
        // CAL - 1st Re-test (คอลัมน์ K)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 10 })] = { 
          v: record.cal_first_retest || '-', 
          t: 's' 
        }
        
        // CAL - 2nd Re-test (คอลัมน์ L)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 11 })] = { 
          v: record.cal_second_retest || '-', 
          t: 's' 
        }
        
        // Golden unit (Conductive) - Test (คอลัมน์ M)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 12 })] = { 
          v: record.golden_conductive_test || '-', 
          t: 's' 
        }
        
        // Golden unit (Conductive) - 1st Re-test (คอลัมน์ N)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 13 })] = { 
          v: record.golden_conductive_first_retest || '-', 
          t: 's' 
        }
        
        // Golden unit (Conductive) - 2nd Re-test (คอลัมน์ O)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 14 })] = { 
          v: record.golden_conductive_second_retest || '-', 
          t: 's' 
        }
        
        // Golden unit (Insulative) - Test (คอลัมน์ P)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 15 })] = { 
          v: record.golden_insulative_test || '-', 
          t: 's' 
        }
        
        // Golden unit (Insulative) - 1st Re-test (คอลัมน์ Q)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 16 })] = { 
          v: record.golden_insulative_first_retest || '-', 
          t: 's' 
        }
        
        // Golden unit (Insulative) - 2nd Re-test (คอลัมน์ R)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 17 })] = { 
          v: record.golden_insulative_second_retest || '-', 
          t: 's' 
        }
        
        // By (คอลัมน์ S)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 18 })] = { 
          v: record.operator_name || '-', 
          t: 's' 
        }
        
        // at (คอลัมน์ T)
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 19 })] = { 
          v: record.test_location || 'CAL Lab', 
          t: 's' 
        }
      })

      // สร้างชื่อไฟล์ตามวันที่ปัจจุบัน
      const today = new Date().toLocaleDateString('th-TH').replace(/\//g, '-')
      const fileName = `ESD_Equipment_Record_${today}.xlsx`

      // ส่งออกไฟล์
      XLSX.writeFile(wb, fileName)
      toast.success('ส่งออก Excel สำเร็จ')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('ส่งออก Excel ไม่สำเร็จ: ' + error.message)
    }
  }

  const handleExportPdf = async () => {
    try {
      toast.loading('กำลังสร้างไฟล์ PDF...')
      
      // กรองข้อมูลตามการค้นหาและวันที่
      let filteredData = testRecords || []
      
      if (searchTerm) {
        filteredData = filteredData.filter(record => 
          getEquipmentName(record.equipment_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.model && record.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (record.serial_number && record.serial_number.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      
      if (dateFilter) {
        filteredData = filteredData.filter(record => 
          record.test_date === dateFilter
        )
      }

      // สร้างข้อมูลสำหรับ PDF
      const pdfData = filteredData.map((record, index) => [
        index + 1,
        new Date(record.test_date).toLocaleDateString('th-TH'),
        getEquipmentName(record.equipment_id),
        record.brand || '-',
        record.model || '-',
        record.serial_number || '-',
        record.calibration_date || '-',
        record.due_date || '-',
        record.temperature || '-',
        record.humidity || '-',
        record.test_location || 'CAL Lab',
        record.operator_name || '-'
      ])

      // สร้าง PDF
      const doc = new jsPDF()
      
      // เพิ่มฟอนต์ภาษาไทย (ถ้ามี) หรือใช้ฟอนต์ปกติ
      doc.setFont('helvetica')
      
      // หัวข้อ
      doc.setFontSize(16)
      doc.text('ESD Equipment Test Records', 14, 20)
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`, 14, 28)
      
      // สร้างตาราง
      doc.setFontSize(8)
      const headers = ['No.', 'Date', 'Equipment', 'Brand', 'Model', 'S/N', 'CAL Date', 'Due Date', 'Temp', 'Humidity', 'Location', 'Operator']
      const data = pdfData
      
      // กำหนดความกว้างคอลัมน์
      const columnWidths = [10, 20, 35, 20, 20, 20, 20, 20, 15, 15, 20, 25]
      const startX = 14
      const startY = 40
      const rowHeight = 7
      
      // วาดหัวตาราง
      headers.forEach((header, index) => {
        const x = startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0)
        doc.text(header, x, startY)
      })
      
      // วาดข้อมูล
      data.forEach((row, rowIndex) => {
        const y = startY + rowHeight * (rowIndex + 1)
        if (y > 280) { // ขึ้นหน้าใหม่ถ้าเกินขนาด
          doc.addPage()
          data.slice(rowIndex).forEach((newRow, newIndex) => {
            const newY = startY + rowHeight * (newIndex + 1)
            newRow.forEach((cell, cellIndex) => {
              const x = startX + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0)
              doc.text(String(cell).substring(0, 15), x, newY) // จำกัดความยาวข้อความ
            })
          })
          return
        }
        
        row.forEach((cell, cellIndex) => {
          const x = startX + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0)
          doc.text(String(cell).substring(0, 15), x, y) // จำกัดความยาวข้อความ
        })
      })
      
      // สร้างชื่อไฟล์ตามวันที่ปัจจุบัน
      const today = new Date().toLocaleDateString('th-TH').replace(/\//g, '-')
      const fileName = `ESD_Equipment_Record_${today}.pdf`

      // บันทึกไฟล์
      doc.save(fileName)
      toast.success('ส่งออก PDF สำเร็จ')
    } catch (error) {
      console.error('PDF Export error:', error)
      toast.error('ส่งออก PDF ไม่สำเร็จ: ' + error.message)
    }
  }

  const handleExportModalPdf = async () => {
    try {
      if (!viewingRecord) return
      
      toast.loading('กำลังสร้างไฟล์ PDF...')
      
      // สร้าง PDF
      const doc = new jsPDF()
      
      // เพิ่มฟอนต์ภาษาไทย (ถ้ามี) หรือใช้ฟอนต์ปกติ
      doc.setFont('helvetica')
      
      // หัวข้อ
      doc.setFontSize(16)
      doc.text('ESD Equipment Test Record Details', 14, 20)
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`, 14, 28)
      
      let yPosition = 40
      
      // ข้อมูลอุปกรณ์
      doc.setFontSize(12)
      doc.text('Equipment Information:', 14, yPosition)
      yPosition += 8
      doc.setFontSize(9)
      
      const equipmentInfo = [
        `Equipment: ${getEquipmentName(viewingRecord.equipment_id)}`,
        `Test Date: ${new Date(viewingRecord.test_date).toLocaleDateString('th-TH')}`,
        `Brand: ${viewingRecord.brand || '-'}`,
        `Model: ${viewingRecord.model || '-'}`,
        `Serial Number: ${viewingRecord.serial_number || '-'}`,
        `Calibration Date: ${viewingRecord.calibration_date || '-'}`,
        `Due Date: ${viewingRecord.due_date || '-'}`,
        `Temperature: ${viewingRecord.temperature || '-'}°C`,
        `Humidity: ${viewingRecord.humidity || '-'}%RH`,
        `Test Location: ${viewingRecord.test_location || 'CAL Lab'}`
      ]
      
      equipmentInfo.forEach(info => {
        doc.text(info, 20, yPosition)
        yPosition += 6
      })
      
      yPosition += 8
      
      // ผลการทดสอบ CAL
      doc.setFontSize(12)
      doc.text('CAL Test Results (Ω):', 14, yPosition)
      yPosition += 8
      doc.setFontSize(9)
      doc.text(`Test: ${viewingRecord.cal_test || '-'}`, 20, yPosition)
      yPosition += 6
      doc.text(`1st Re-test: ${viewingRecord.cal_first_retest || '-'}`, 20, yPosition)
      yPosition += 6
      doc.text(`2nd Re-test: ${viewingRecord.cal_second_retest || '-'}`, 20, yPosition)
      yPosition += 8
      
      // Golden Unit Conductive
      doc.setFontSize(12)
      doc.text('Golden Unit (Conductive) Test Results (Ω):', 14, yPosition)
      yPosition += 8
      doc.setFontSize(9)
      doc.text(`Test: ${viewingRecord.golden_conductive_test || '-'}`, 20, yPosition)
      yPosition += 6
      doc.text(`1st Re-test: ${viewingRecord.golden_conductive_first_retest || '-'}`, 20, yPosition)
      yPosition += 6
      doc.text(`2nd Re-test: ${viewingRecord.golden_conductive_second_retest || '-'}`, 20, yPosition)
      yPosition += 8
      
      // Golden Unit Insulative
      doc.setFontSize(12)
      doc.text('Golden Unit (Insulative) Test Results (Ω):', 14, yPosition)
      yPosition += 8
      doc.setFontSize(9)
      doc.text(`Test: ${viewingRecord.golden_insulative_test || '-'}`, 20, yPosition)
      yPosition += 6
      doc.text(`1st Re-test: ${viewingRecord.golden_insulative_first_retest || '-'}`, 20, yPosition)
      yPosition += 6
      doc.text(`2nd Re-test: ${viewingRecord.golden_insulative_second_retest || '-'}`, 20, yPosition)
      yPosition += 8
      
      // ข้อมูลเพิ่มเติม
      doc.setFontSize(12)
      doc.text('Additional Information:', 14, yPosition)
      yPosition += 8
      doc.setFontSize(9)
      doc.text(`Operator: ${viewingRecord.operator_name || '-'}`, 20, yPosition)
      yPosition += 6
      doc.text(`Status: ${viewingRecord.status === 'pass' ? 'ผ่าน' : viewingRecord.status === 'fail' ? 'ไม่ผ่าน' : 'รอดำเนินการ'}`, 20, yPosition)
      
      // สร้างชื่อไฟล์
      const today = new Date().toLocaleDateString('th-TH').replace(/\//g, '-')
      const equipmentName = getEquipmentName(viewingRecord.equipment_id).replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `ESD_TestRecord_${equipmentName}_${today}.pdf`

      // บันทึกไฟล์
      doc.save(fileName)
      toast.success('ส่งออก PDF สำเร็จ')
    } catch (error) {
      console.error('Modal PDF Export error:', error)
      toast.error('ส่งออก PDF ไม่สำเร็จ: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">บันทึกผลการทดสอบ</h1>
          <p className="text-gray-600">บันทึกผลการทดสอบการสอบเทียบเครื่องวัดค่าความต้านทาน</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          เพิ่มบันทึกการทดสอบ
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
          <div className="min-w-full">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ทดสอบ</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภทการทดสอบ</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">อุปกรณ์</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">รุ่น</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">หมายเลขซีเรียล</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">สถานที่</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ดำเนินการ</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="loading-spinner mx-auto" />
                  </td>
                </tr>
              ) : filteredTestRecords?.length > 0 ? (
                filteredTestRecords.slice(0, 5).map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.test_date).toLocaleDateString('th-TH')}</td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.test_type === 'daily_check' && 'การทดสอบเช็คประจำวัน'}
                        {record.test_type === 'cal_test' && 'CAL Test'}
                        {record.test_type === 'golden_conductive' && 'Golden Unit (Conductive)'}
                        {record.test_type === 'golden_insulative' && 'Golden Unit (Insulative)'}
                        {record.test_type === 'full_test' && 'การทดสอบทั้งหมด'}
                        {!record.test_type && 'การทดสอบเช็คประจำวัน'}
                      </span>
                    </td>
                    <td className="font-medium">{getEquipmentName(record.equipment_id)}</td>
                    <td>{record.model || '-'}</td>
                    <td>{record.serial_number || '-'}</td>
                    <td>{record.test_location || 'CAL Lab'}</td>
                    <td>{record.operator_name || '-'}</td>
                    <td className="text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleView(record)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="ดูรายละเอียด"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record)}
                          className="p-1 text-gray-400 hover:text-red-600"
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
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingRecord) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
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

                {/* Test Type Selection */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">ประเภทการทดสอบ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ประเภทการทดสอบ *
                      </label>
                      <select
                        value={formData.test_type}
                        onChange={(e) => setFormData({...formData, test_type: e.target.value})}
                        className="input"
                        required
                      >
                        <option value="daily_check">การทดสอบเช็คประจำวัน</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* CAL Test Results */}
                {(formData.test_type === 'daily_check' || formData.test_type === 'cal_test' || formData.test_type === 'full_test') && (
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
                )}

                {/* Golden Unit Conductive Test Results */}
                {(formData.test_type === 'daily_check' || formData.test_type === 'golden_conductive' || formData.test_type === 'full_test') && (
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
                )}

                {/* Golden Unit Insulative Test Results */}
                {(formData.test_type === 'daily_check' || formData.test_type === 'golden_insulative' || formData.test_type === 'full_test') && (
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
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingRecord(null)
                      resetForm()
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

      {/* View Record Modal */}
      {showViewModal && viewingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    ดูรายละเอียดบันทึกผลการทดสอบ
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setViewingRecord(null)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Equipment Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">ข้อมูลอุปกรณ์</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">วันที่ทดสอบ</label>
                      <p className="text-gray-900">{new Date(viewingRecord.test_date).toLocaleDateString('th-TH')}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">อุปกรณ์</label>
                      <p className="text-gray-900 font-medium">{getEquipmentName(viewingRecord.equipment_id)}</p>
                    </div>
                    

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">ยี่ห้อ</label>
                      <p className="text-gray-900">{viewingRecord.brand || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">รุ่น</label>
                      <p className="text-gray-900">{viewingRecord.model || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">หมายเลขซีเรียล</label>
                      <p className="text-gray-900">{viewingRecord.serial_number || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">วันที่สอบเทียบ</label>
                      <p className="text-gray-900">{viewingRecord.calibration_date || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">วันที่ครบกำหนดสอบเทียบ</label>
                      <p className="text-gray-900">{viewingRecord.due_date || '-'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">อุณหภูมิ (°C)</label>
                      <p className="text-gray-900">{viewingRecord.temperature || '-'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">ความชื้น (%RH)</label>
                      <p className="text-gray-900">{viewingRecord.humidity || '-'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">สถานที่ทดสอบ</label>
                      <p className="text-gray-900">{viewingRecord.test_location || 'CAL Lab'}</p>
                    </div>
                  </div>
                </div>

                {/* General Requirement */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">General Requirement</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      • Shall perform ESD equipment Buy-off at CAL Lab<br/>
                      • and perform ESD equipment Verification in the field
                    </p>
                  </div>
                </div>

                {/* Environment Control */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Environment Control</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      • Refer to Environment Control Procedure 003-000-000125<br/>
                    </p>
                  </div>
                </div>

                {/* Specification of CAL */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specification of CAL, Ready to take measurements</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Calibration Equipment</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Specification</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Eqipment Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-900">Calibration shunt : </td>
                          <td className="px-4 py-2 text-sm text-gray-900">1.02 ± 0.02 ohms (1.00-1.04 Ohms)</td>
                          <td className="px-4 py-2 text-sm text-gray-900">for Brand Prostat, Model PRS-801</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-900">Test Lead Shunt : </td>
                          <td className="px-4 py-2 text-sm text-gray-900">&lt; 0.35 ohms</td>
                          <td className="px-4 py-2 text-sm text-gray-900">for Brand Prostat, Model PRS-801B</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-900">Ready to take measurements : </td>
                          <td className="px-4 py-2 text-sm text-gray-900">Display show "Go"</td>
                          <td className="px-4 py-2 text-sm text-gray-900">for Brand Prostat, Model PAS-853</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Specification of Golden unit */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specification of Golden unit for Verification</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Conductive Range :  &lt; 1.0 x 10<sup>3</sup> Ohms</li>
                            <li>• Insulative Range :  &gt; 1.0 x 10<sup>11</sup> Ohms</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CAL Test Results */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">ผลการทดสอบ CAL (Ω)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Test</label>
                      <p className="text-gray-900 font-mono">{viewingRecord.cal_test || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">1st Re-test</label>
                      <p className="text-gray-900 font-mono">{viewingRecord.cal_first_retest || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">2nd Re-test</label>
                      <p className="text-gray-900 font-mono">{viewingRecord.cal_second_retest || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Golden Unit Conductive Test Results */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Golden Unit (Conductive) Test Results (Ω)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Test</label>
                      <p className="text-gray-900 font-mono">{viewingRecord.golden_conductive_test || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">1st Re-test</label>
                      <p className="text-gray-900 font-mono">{viewingRecord.golden_conductive_first_retest || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">2nd Re-test</label>
                      <p className="text-gray-900 font-mono">{viewingRecord.golden_conductive_second_retest || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Golden Unit Insulative Test Results */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Golden Unit (Insulative) Test Results (Ω)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Test</label>
                      <p className="text-gray-900 font-mono">{viewingRecord.golden_insulative_test || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">1st Re-test</label>
                      <p className="text-gray-900 font-mono">{viewingRecord.golden_insulative_first_retest || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">2nd Re-test</label>
                      <p className="text-gray-900 font-mono">{viewingRecord.golden_insulative_second_retest || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">ข้อมูลเพิ่มเติม</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">ผู้ดำเนินการ</label>
                      <p className="text-gray-900">{viewingRecord.operator_name || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">สถานะ</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewingRecord.status === 'pass' 
                          ? 'bg-green-100 text-green-800' 
                          : viewingRecord.status === 'fail'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {viewingRecord.status === 'pass' ? 'ผ่าน' : 
                         viewingRecord.status === 'fail' ? 'ไม่ผ่าน' : 'รอดำเนินการ'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  ปิด
                </button>
                <button
                  onClick={handleExportModalPdf}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  ส่งออก PDF
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEdit(viewingRecord)
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  แก้ไขข้อมูล
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestRecords
