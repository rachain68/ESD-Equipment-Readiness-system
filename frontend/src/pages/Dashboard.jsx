import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { equipmentAPI, testRecordsAPI, reportAPI } from '../services/api'
import { 
  WrenchScrewdriverIcon, 
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const StatCard = ({ title, value, icon: Icon, color = 'primary', to }) => {
  const colorClasses = {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    error: 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
  }

  const card = (
    <div className="card p-6 flex flex-col justify-between h-36 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-xl ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block w-full hover:cursor-pointer">{card}</Link>
    )
  }

  return <div className="w-full">{card}</div>
}

const Dashboard = () => {
  // ดึงข้อมูลสถิติอุปกรณ์ (ปิดชั่วคราวเพื่อแก้ไขปัญหา refresh)
  const { data: equipmentStats, isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment-stats'],
    queryFn: () => equipmentAPI.getStats().then(res => res.data),
    retry: false,
    refetchInterval: false,
    staleTime: Infinity,
    enabled: true,
  })

  // ดึงข้อมูลสถิติการทดสอบ (ปิดชั่วคราวเพื่อแก้ไขปัญหา refresh)
  const { data: testStats, isLoading: testLoading } = useQuery({
    queryKey: ['test-stats'],
    queryFn: () => testRecordsAPI.getStats().then(res => res.data),
    retry: false,
    refetchInterval: false,
    staleTime: Infinity,
    enabled: true,
  })

  // ดึงข้อมูลสรุปรายงาน (ปิดชั่วคราวเพื่อแก้ไขปัญหา refresh)
  const { data: reportSummary, isLoading: reportLoading } = useQuery({
    queryKey: ['report-summary'],
    queryFn: () => reportAPI.getSummary().then(res => res.data),
    retry: false,
    refetchInterval: false,
    staleTime: Infinity,
    enabled: true,
  })

  // ดึงข้อมูลการทดสอบล่าสุด (ปิดชั่วคราวเพื่อแก้ไขปัญหา refresh)
  const { data: latestTests, isLoading: latestLoading } = useQuery({
    queryKey: ['latest-tests'],
    queryFn: () => testRecordsAPI.getAll({ limit: 5 }).then(res => res.data?.test_records || res.data || []),
    retry: false,
    refetchInterval: false,
    staleTime: Infinity,
    enabled: true,
  })

  // แสดง loading state แค่ครั้งเดียว
  const isLoading = equipmentLoading || testLoading || reportLoading || latestLoading
  
  // Use backend data; fallback to sensible defaults
  const stats = equipmentStats || { total: 0, active: 0, maintenance: 0, retired: 0 }
  const tests = testStats || { total: 0, pass: 0, fail: 0, pending: 0 }
  const reports = reportSummary || { total: 0, approved: 0, rejected: 0, pending: 0 }
  const latest = latestTests || []
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">แดชบอร์ด</h1>
        <p className="text-gray-600">ภาพรวมสถานะระบบทดสอบเครื่องวัดค่าความต้านทาน</p>
      </div>

      {/* Stats Grid - single row on md+ screens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="อุปกรณ์ทั้งหมด"
          value={stats.total || 0}
          icon={WrenchScrewdriverIcon}
          color="primary"
          to="/equipment"
        />
        <StatCard
          title="อุปกรณ์ที่ใช้งานได้"
          value={stats.active || 0}
          icon={CheckCircleIcon}
          color="success"
          to="/equipment"
        />
        <StatCard
          title="การทดสอบทั้งหมด"
          value={tests.total || 0}
          icon={BeakerIcon}
          color="primary"
          to="/test-records-and-reports"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Test Status */}
        <div className="card p-6 h-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">สถานะการทดสอบ</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white mr-3">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">ผ่าน</p>
                  <p className="text-sm text-gray-600">การทดสอบที่สำเร็จ</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {tests.pass || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white mr-3">
                  <XCircleIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">ไม่ผ่าน</p>
                  <p className="text-sm text-gray-600">การทดสอบที่ล้มเหลว</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {tests.fail || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white mr-3">
                  <ClockIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">รอดำเนินการ</p>
                  <p className="text-sm text-gray-600">กำลังรอการทดสอบ</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {tests.pending || 0}
              </span>
            </div>
            
            {testStats?.avgResistance && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">ค่าความต้านทานเฉลี่ย</span>
                  <span className="text-xl font-bold text-gray-900">
                    {parseFloat(testStats.avgResistance).toFixed(2)} Ω
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Latest Tests */}
        <div className="card p-6 h-full">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">การทดสอบล่าสุด</h3>
          </div>
          <div className="space-y-3">
            {latest?.length > 0 ? (
              latest.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {test.equipment_name || 'Unknown Equipment'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(test.test_date).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {test.cal_test ? parseFloat(test.cal_test).toFixed(2) : '0.00'} Ω
                    </p>
                    <span className={`badge ${
                      test.status === 'pass' ? 'badge-success' :
                      test.status === 'fail' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {test.status === 'pass' ? 'ผ่าน' :
                       test.status === 'fail' ? 'ไม่ผ่าน' : 'รอดำเนินการ'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">ยังไม่มีข้อมูลการทดสอบ</p>
            )}
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">สรุปรายงาน</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-600 mb-2">รายงานประจำวัน</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ทั้งหมด:</span>
                  <span className="font-semibold">{reportSummary?.daily?.total || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ผ่าน:</span>
                  <span className="font-semibold text-success-600">{reportSummary?.daily?.pass || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ไม่ผ่าน:</span>
                  <span className="font-semibold text-error-600">{reportSummary?.daily?.fail || 0}</span>
                </div>
              </div>
            </div>

            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-600 mb-2">รายงาน By-Off</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ทั้งหมด:</span>
                  <span className="font-semibold">{reportSummary?.byOff?.total || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ผ่าน:</span>
                  <span className="font-semibold text-success-600">{reportSummary?.byOff?.pass || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ไม่ผ่าน:</span>
                  <span className="font-semibold text-error-600">{reportSummary?.byOff?.fail || 0}</span>
                </div>
              </div>
            </div>

            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-600 mb-2">รายงาน IQA</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ทั้งหมด:</span>
                  <span className="font-semibold">{reportSummary?.iqa?.total || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>อนุมัติ:</span>
                  <span className="font-semibold text-success-600">{reportSummary?.iqa?.approved || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ปฏิเสธ:</span>
                  <span className="font-semibold text-error-600">{reportSummary?.iqa?.rejected || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
