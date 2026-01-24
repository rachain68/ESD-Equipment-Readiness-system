import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // สร้าง socket connection แค่ครั้งเดียว
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
      timeout: 5000,
      reconnection: false, // ปิด auto reconnect เพื่อป้องกัน infinite loop
    })

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setConnected(true)
      // ลบ toast ออกเพื่อไม่ให้รบกวน
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnected(false)
    })

    // รับข้อมูลการทดสอบแบบเรียลไทม์
    newSocket.on('test-update', (data) => {
      console.log('Test update received:', data)
      
      switch (data.type) {
        case 'new_test':
          // ลบ toast ออกเพื่อไม่ให้รบกวน
          break
        case 'updated_test':
          // ลบ toast ออกเพื่อไม่ให้รบกวน
          break
        default:
          break
      }
    })

    setSocket(newSocket)

    // Cleanup เมื่อ component unmount
    return () => {
      newSocket.disconnect()
    }
  }, []) // Empty dependency array - ทำงานแค่ครั้งเดียว

  const emitTestData = (data) => {
    if (socket && connected) {
      socket.emit('test-data', data)
    }
  }

  const value = {
    socket,
    connected,
    emitTestData
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
