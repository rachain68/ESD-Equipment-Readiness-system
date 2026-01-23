import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const AuthProviderComponent = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ตรวจสอบสถานะการล็อกอินเมื่อโหลดแอป
  useEffect(() => {
    // ตัดการตรวจสอบการล็อกอินชั่วคราว
    setLoading(false)
    
    // เพิ่มข้อมูลผู้ใช้จำลองเพื่อทดสอบ
    setUser({
      id: 1,
      username: 'admin',
      email: 'admin@esd.com',
      role: 'admin',
      full_name: 'System Administrator'
    })
    
    /*
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await authAPI.getProfile()
          setUser(response.data)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    // ตั้ง timeout ป้องกันการ loading ค้าง
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    checkAuth()
    
    return () => clearTimeout(timeout)
    */
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { user: userData, token } = response.data
      
      localStorage.setItem('token', token)
      setUser(userData)
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Login failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'การเข้าสู่ระบบล้มเหลว' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { user: newUser, token } = response.data
      
      localStorage.setItem('token', token)
      setUser(newUser)
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Registration failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'การสมัครสมาชิกล้มเหลว' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData)
      setUser(response.data.user)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Profile update failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'การอัปเดตข้อมูลล้มเหลว' 
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'operator',
    isInspector: user?.role === 'inspector'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const AuthProvider = AuthProviderComponent
