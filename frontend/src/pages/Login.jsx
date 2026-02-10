import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.username || !formData.password) {
      toast.error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
      return
    }
    setLoading(true)
    try {
      const result = await login(formData)
      if (result.success) {
        toast.success('เข้าสู่ระบบสำเร็จ')
        navigate('/dashboard')
      } else {
        toast.error(result.error)
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-5xl bg-white/60 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Illustration / Branding */}
        <div className="hidden md:flex flex-col items-center justify-center p-10 bg-gradient-to-tr from-primary-700 to-primary-500 text-white">
          <div className="mb-6">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="rgba(255,255,255,0.08)" />
              <path d="M7 12h10M7 8h10M7 16h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold">ESD Equipment Readiness</h3>
          <p className="mt-2 text-sm opacity-90 text-center max-w-xs">ระบบทดสอบเครื่องวัดค่าความต้านทาน — ตรวจสอบความพร้อมใช้งาน, บันทึกผล และรายงาน</p>
        </div>

        {/* Form */}
        <div className="p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary-100">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">เข้าสู่ระบบ</h2>
                <p className="text-sm text-slate-500">เข้าสู่ระบบด้วยบัญชีของคุณเพื่อดูแดชบอร์ด</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="กรอกชื่อผู้ใช้"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="กรอกรหัสผ่าน"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                  <span className="text-slate-600">จดจำฉัน</span>
                </label>
                <a href="#" className="text-primary-600 hover:underline">ลืมรหัสผ่าน?</a>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-medium ${loading ? 'bg-primary-400/70 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
                >
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              <p>หรือใช้บัญชีสำหรับทดสอบ</p>
              <div className="mt-2 text-xs text-slate-600">
                <div>Admin: admin / password123</div>
                <div>Operator: operator1 / password123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
