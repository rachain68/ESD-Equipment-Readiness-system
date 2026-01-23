import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { 
  UserIcon, 
  Cog6ToothIcon, 
  BellIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

const Settings = () => {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'profile', name: 'ข้อมูลส่วนตัว', icon: UserIcon },
    { id: 'notifications', name: 'การแจ้งเตือน', icon: BellIcon },
    { id: 'security', name: 'ความปลอดภัย', icon: ShieldCheckIcon },
    { id: 'system', name: 'ระบบ', icon: ComputerDesktopIcon }
  ]

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateProfile({
        full_name: formData.full_name,
        email: formData.email
      })

      if (result.success) {
        toast.success('อัปเดตข้อมูลสำเร็จ')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">ข้อมูลส่วนตัว</h3>
          <p className="text-sm text-gray-600">อัปเดตข้อมูลส่วนตัวของคุณ</p>
        </div>
        
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="input bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                บทบาท
              </label>
              <input
                type="text"
                value={
                  user?.role === 'admin' ? 'ผู้ดูแลระบบ' :
                  user?.role === 'operator' ? 'ผู้ดำเนินการ' :
                  user?.role === 'inspector' ? 'ผู้ตรวจสอบ' : '-'
                }
                disabled
                className="input bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อเต็ม
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="input"
              placeholder="กรอกชื่อเต็มของคุณ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input"
              placeholder="กรอกอีเมลของคุณ"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner mr-2" />
                  กำลังอัปเดต...
                </div>
              ) : (
                'อัปเดตข้อมูล'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">เปลี่ยนรหัสผ่าน</h3>
          <p className="text-sm text-gray-600">เปลี่ยนรหัสผ่านเพื่อความปลอดภัย</p>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่านปัจจุบัน
            </label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({...formData, current_password: e.target.value})}
              className="input"
              placeholder="กรอกรหัสผ่านปัจจุบัน"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่านใหม่
            </label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({...formData, new_password: e.target.value})}
              className="input"
              placeholder="กรอกรหัสผ่านใหม่"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              type="password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
              className="input"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            />
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => toast.info('ฟีเจอร์นี้ยังไม่เปิดใช้งาน')}
          >
            เปลี่ยนรหัสผ่าน
          </button>
        </form>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">การแจ้งเตือน</h3>
          <p className="text-sm text-gray-600">จัดการการตั้งค่าการแจ้งเตือน</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">การแจ้งเตือนแบบเรียลไทม์</h4>
              <p className="text-sm text-gray-600">รับการแจ้งเตือนเมื่อมีการทดสอบใหม่</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">อีเมลแจ้งเตือน</h4>
              <p className="text-sm text-gray-600">รับอีเมลแจ้งเตือนเมื่อมีรายงานใหม่</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">การแจ้งเตือนการบำรุงรักษา</h4>
              <p className="text-sm text-gray-600">แจ้งเตือนเมื่อใกล้ถึงกำหนดสอบเทียบ</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">ความปลอดภัย</h3>
          <p className="text-sm text-gray-600">จัดการการตั้งค่าความปลอดภัย</p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800">การเชื่อมต่อปลอดภัย</h4>
            <p className="text-sm text-green-600 mt-1">คุณกำลังใช้การเชื่อมต่อ HTTPS ที่ปลอดภัย</p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800">การตรวจสอบสิทธิ์แบบ 2 ขั้นตอน</h4>
            <p className="text-sm text-blue-600 mt-1">เปิดใช้งานการตรวจสอบสิทธิ์ 2 ขั้นตอนเพื่อความปลอดภัยเพิ่มเติม</p>
            <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
              เรียนรู้เพิ่มเติม →
            </button>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800">ประวัติการเข้าสู่ระบบ</h4>
            <p className="text-sm text-yellow-600 mt-1">ดูประวัติการเข้าสู่ระบบล่าสุด</p>
            <button className="mt-2 text-sm text-yellow-600 hover:text-yellow-800">
              ดูประวัติ →
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">ข้อมูลระบบ</h3>
          <p className="text-sm text-gray-600">ข้อมูลเกี่ยวกับระบบและเวอร์ชัน</p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">เวอร์ชันแอปพลิเคชัน</h4>
              <p className="text-sm text-gray-600">v1.0.0</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">เวอร์ชันฐานข้อมูล</h4>
              <p className="text-sm text-gray-600">v1.0.0</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">สภาพแวดล้อม</h4>
              <p className="text-sm text-gray-600">Development</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">เวลาเซิร์ฟเวอร์</h4>
              <p className="text-sm text-gray-600">{new Date().toLocaleString('th-TH')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">การสำรองข้อมูล</h3>
          <p className="text-sm text-gray-600">จัดการการสำรองข้อมูลระบบ</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">การสำรองข้อมูลอัตโนมัติ</h4>
              <p className="text-sm text-gray-600">สำรองข้อมูลทุกวันเวลา 02:00 น.</p>
            </div>
            <button className="btn-outline">
              ตั้งค่า
            </button>
          </div>

          <div className="flex space-x-3">
            <button className="btn-primary">
              สำรองข้อมูลตอนนี้
            </button>
            <button className="btn-secondary">
              ดูประวัติการสำรอง
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'security':
        return renderSecurityTab()
      case 'system':
        return renderSystemTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่า</h1>
        <p className="text-gray-600">จัดการการตั้งค่าระบบและข้อมูลส่วนตัว</p>
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

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

export default Settings
