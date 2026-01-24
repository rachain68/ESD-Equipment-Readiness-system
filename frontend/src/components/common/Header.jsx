import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import { 
  HomeIcon, 
  WrenchScrewdriverIcon, 
  BeakerIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  WifiIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline'
import { useLocation, useNavigate } from 'react-router-dom'

const Header = () => {
  const { user, logout, isAdmin } = useAuth()
  const { connected } = useSocket()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'แดชบอร์ด', href: '/dashboard', icon: HomeIcon },
    { name: 'อุปกรณ์', href: '/equipment', icon: WrenchScrewdriverIcon },
    { name: 'การทดสอบ', href: '/testing', icon: BeakerIcon },
    { name: 'รายงาน', href: '/reports', icon: DocumentTextIcon },
    ...(isAdmin ? [{ name: 'ตั้งค่า', href: '/settings', icon: Cog6ToothIcon }] : [])
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white">ESD System</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-md'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </button>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              {connected ? (
                <>
                  <WifiIcon className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Online</span>
                </>
              ) : (
                <>
                  <SignalSlashIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-medium">Offline</span>
                </>
              )}
            </div>

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
