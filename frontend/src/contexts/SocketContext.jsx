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
    // สร้าง socket connection
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: false, // ไม่เชื่อมต่ออัตโนมัติ
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000
    })

    // พยายามเชื่อมต่อ
    newSocket.connect()

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setConnected(true)
      toast.success('เชื่อมต่อแบบเรียลไทม์สำเร็จ')
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnected(false)
      // ไม่แสดง toast error ทุกครั้งเพื่อไม่ให้รบกวนผู้ใช้
    })

    // รับข้อมูลการทดสอบแบบเรียลไทม์
    newSocket.on('test-update', (data) => {
      console.log('Test update received:', data)
      
      switch (data.type) {
        case 'new_test':
          toast.success(`มีการทดสอบใหม่: ${data.equipment}`)
          break
        case 'updated_test':
          toast('ข้อมูลการทดสอบถูกอัปเดต')
          break
        default:
          break
      }
    })

    setSocket(newSocket)

    // Cleanup
    return () => {
      newSocket.close()
    }
  }, [])

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
