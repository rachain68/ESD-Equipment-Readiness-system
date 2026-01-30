import axios from 'axios'

// สร้าง axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - เพิ่ม token ใน header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - จัดการ error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token หมดอายุหรือไม่ถูกต้อง
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
}

// Equipment APIs
export const equipmentAPI = {
  getAll: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  getStats: () => api.get('/equipment/stats'),
}


// Report APIs
export const reportAPI = {
  // Daily Check Reports
  getDaily: (params) => api.get('/reports/daily', { params }),
  createDaily: (data) => api.post('/reports/daily', data),
  
  // By-Off Reports
  getByOff: (params) => api.get('/reports/byoff', { params }),
  createByOff: (data) => api.post('/reports/byoff', data),
  
  // IQA Reports
  getIQA: (params) => api.get('/reports/iqa', { params }),
  createIQA: (data) => api.post('/reports/iqa', data),
  
  // Summary
  getSummary: (params) => api.get('/reports/summary', { params }),
}

// Test Records APIs
export const testRecordsAPI = {
  getAll: (params) => api.get('/test-records', { params }),
  getById: (id) => api.get(`/test-records/${id}`),
  create: (data) => api.post('/test-records', data),
  update: (id, data) => api.put(`/test-records/${id}`, data),
  delete: (id) => api.delete(`/test-records/${id}`),
  getStats: (params) => api.get('/test-records/stats', { params }),
  exportExcel: (params) => api.get('/test-records/export/excel', { params }),
}

export default api
