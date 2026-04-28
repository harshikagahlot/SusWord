import { io } from 'socket.io-client'

// Use environment variable, fallback to Railway in production, or localhost in dev
const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? 'http://localhost:3001' : 'https://susword-backend-production.up.railway.app')

// Single socket instance shared across the app
let socket = null

export function getSocket() {
  if (!socket) {
    console.log(`🔌 Initializing socket connection to EXACT URL: "${SERVER_URL}"`)
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'], // Force WebSocket only
      upgrade: false,            // Prevent long-polling upgrade issues
    })
    
    // Add temporary global error logging
    socket.on('connect_error', (err) => {
      console.error(`🔌 Socket global connect_error: [${err.message}]`, err)
    })
    socket.on('connect', () => {
      console.log(`🔌 Socket connect SUCCESS. ID: ${socket.id}`)
    })
  }
  return socket
}

/**
 * Connect to server and return a promise that resolves when connected.
 */
export function connectSocket() {
  return new Promise((resolve, reject) => {
    const s = getSocket()
    if (s.connected) {
      resolve(s)
      return
    }

    const onConnect = () => {
      cleanup()
      console.log('🔌 Socket connected:', s.id)
      resolve(s)
    }

    const onError = (err) => {
      cleanup()
      console.error('🔌 Socket connection error:', err)
      reject(err)
    }

    const cleanup = () => {
      s.off('connect', onConnect)
      s.off('connect_error', onError)
    }

    s.once('connect', onConnect)
    s.once('connect_error', onError)
    s.connect()
  })
}

/**
 * Disconnect from server (call on leave room).
 */
export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect()
  }
}
