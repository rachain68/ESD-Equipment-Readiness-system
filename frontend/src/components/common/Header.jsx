import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  HomeIcon, 
  WrenchScrewdriverIcon, 
  BeakerIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useLocation, useNavigate } from 'react-router-dom'

const Header = () => {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'แดชบอร์ด', href: '/dashboard', icon: HomeIcon },
    { name: 'อุปกรณ์', href: '/equipment', icon: WrenchScrewdriverIcon },
    { name: 'การทดสอบ', href: '/testing', icon: BeakerIcon },
    { name: 'บันทึกผลการทดสอบ', href: '/test-records', icon: ClipboardDocumentListIcon },
    { name: 'รายงาน', href: '/reports', icon: DocumentTextIcon },
    ...(isAdmin ? [{ name: 'ตั้งค่า', href: '/settings', icon: Cog6ToothIcon }] : [])
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="glass sticky top-0 z-50 relative" style={{ zIndex: 100 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white">ESD System</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1 relative" style={{ zIndex: 101 }}>
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    console.log('Navigating to:', item.href)
                    navigate(item.href)
                  }}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer pointer-events-auto relative ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-md'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  style={{ pointerEvents: 'auto', zIndex: 102 }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </button>
              )
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => {
                console.log('Mobile menu clicked')
                // TODO: Add mobile menu logic
              }}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              style={{ pointerEvents: 'auto', zIndex: 102 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-white/70 capitalize">{user?.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="ออกจากระบบ"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
