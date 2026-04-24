import { io } from 'socket.io-client'

const SERVER_URL = 'http://localhost:3001'

// Single socket instance shared across the app
let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

/**
 * Connect to server and return a promise that resolves when connected.
 */
export function connectSocket() {
  return new Promise((resolve) => {
    const s = getSocket()
    if (s.connected) {
      resolve(s)
      return
    }
    s.connect()
    s.once('connect', () => {
      console.log('🔌 Socket connected:', s.id)
      resolve(s)
    })
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
