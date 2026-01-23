import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { equipmentAPI, testAPI, reportAPI } from '../services/api'
import { 
  WrenchScrewdriverIcon, 
  BeakerIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    error: 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
  }

  return (
    <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
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
}

const Dashboard = () => {
  // ดึงข้อมูลสถิติอุปกรณ์
  const { data: equipmentStats } = useQuery({
    queryKey: ['equipment-stats'],
    queryFn: () => equipmentAPI.getStats().then(res => res.data)
  })

  // ดึงข้อมูลสถิติการทดสอบ
  const { data: testStats } = useQuery({
    queryKey: ['test-stats'],
    queryFn: () => testAPI.getStats().then(res => res.data)
  })

  // ดึงข้อมูลสรุปรายงาน
  const { data: reportSummary } = useQuery({
    queryKey: ['report-summary'],
    queryFn: () => reportAPI.getSummary().then(res => res.data)
  })

  // ดึงข้อมูลการทดสอบล่าสุด
  const { data: latestTests } = useQuery({
    queryKey: ['latest-tests'],
    queryFn: () => testAPI.getLatest({ limit: 5 }).then(res => res.data)
  })

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">แดชบอร์ด</h1>
        <p className="text-gray-600">ภาพรวมสถานะระบบทดสอบเครื่องวัดค่าความต้านทาน</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="อุปกรณ์ทั้งหมด"
          value={equipmentStats?.total || 0}
          icon={WrenchScrewdriverIcon}
          color="primary"
        />
        <StatCard
          title="อุปกรณ์ที่ใช้งานได้"
          value={equipmentStats?.active || 0}
          icon={CheckCircleIcon}
          color="success"
        />
        <StatCard
          title="การทดสอบทั้งหมด"
          value={testStats?.total || 0}
          icon={BeakerIcon}
          color="primary"
        />
        <StatCard
          title="รายงานทั้งหมด"
          value={
            (reportSummary?.daily?.total || 0) + 
            (reportSummary?.byOff?.total || 0) + 
            (reportSummary?.iqa?.total || 0)
          }
          icon={DocumentTextIcon}
          color="warning"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Status */}
        <div className="card p-6">
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
                {testStats?.pass || 0}
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
                {testStats?.fail || 0}
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
                {testStats?.pending || 0}
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
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">การทดสอบล่าสุด</h3>
          </div>
          <div className="space-y-3">
            {latestTests?.length > 0 ? (
              latestTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {test.equipment?.name || 'Unknown Equipment'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(test.test_date).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {parseFloat(test.resistance_value).toFixed(2)} Ω
                    </p>
                    <span className={`badge ${
                      test.test_status === 'pass' ? 'badge-success' :
                      test.test_status === 'fail' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {test.test_status === 'pass' ? 'ผ่าน' :
                       test.test_status === 'fail' ? 'ไม่ผ่าน' : 'รอดำเนินการ'}
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
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">สรุปรายงาน</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
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

          <div className="text-center">
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

          <div className="text-center">
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
  )
}

export default Dashboard
