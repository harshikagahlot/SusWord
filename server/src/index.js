const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { createRoom, joinRoom, leaveRoom, getRoom, getRoomBySocketId } = require('./roomManager')
const { startRound, getPlayerRevealData, setPlayerReady } = require('./gameManager')

const PORT = 3001

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST'],
  },
})

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'SusWord server running', port: PORT })
})

// ── Socket.IO ──────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ Connected: ${socket.id}`)

  // ── Create Room ──────────────────────────────────────────
  socket.on('create-room', ({ playerName }, callback) => {
    const result = createRoom(socket.id, playerName)
    if (result.error) return callback({ error: result.error })

    const { room, player } = result
    socket.join(room.roomCode)

    callback({
      roomCode: room.roomCode,
      playerId: player.id,
      players: room.players,
      hostId: room.hostId,
    })
    console.log(`🏠 Room ${room.roomCode} created by ${playerName}`)
  })

  // ── Join Room ────────────────────────────────────────────
  socket.on('join-room', ({ roomCode, playerName }, callback) => {
    const result = joinRoom(socket.id, roomCode, playerName)
    if (result.error) return callback({ error: result.error })

    const { room, player } = result
    socket.join(room.roomCode)

    callback({
      roomCode: room.roomCode,
      playerId: player.id,
      players: room.players,
      hostId: room.hostId,
    })

    socket.to(room.roomCode).emit('lobby-update', {
      players: room.players,
      hostId: room.hostId,
    })
    console.log(`👤 ${playerName} joined room ${roomCode}`)
  })

  // ── Leave Room ───────────────────────────────────────────
  socket.on('leave-room', () => {
    handleDisconnect(socket)
  })

  // ── Start Game (Phase 4 — real round) ────────────────────
  socket.on('start-game', (callback) => {
    const room = getRoomBySocketId(socket.id)

    if (!room) return callback?.({ error: 'Room not found' })
    if (room.hostId !== socket.id) return callback?.({ error: 'Only the host can start' })
    if (room.players.length < 3) return callback?.({ error: 'Need at least 3 players' })
    if (room.gameState !== 'LOBBY') return callback?.({ error: 'Game already in progress' })

    // Create round: pick imposter, assign words
    startRound(room)
    console.log(`🎮 Round started in ${room.roomCode} | Imposter: ${room.roundData.imposterId}`)
    console.log(`   Words: "${room.roundData.wordPair.mainWord}" / "${room.roundData.wordPair.imposterWord}"`)

    callback?.({ success: true })

    // Send PRIVATE reveal data to each player individually
    room.players.forEach(player => {
      const revealData = getPlayerRevealData(room, player.id)
      io.to(player.id).emit('game-started', revealData)
    })
  })

  // ── Player Ready (after viewing card) ────────────────────
  socket.on('player-ready', (callback) => {
    const room = getRoomBySocketId(socket.id)
    if (!room || room.gameState !== 'REVEAL') {
      return callback?.({ error: 'Not in reveal phase' })
    }

    const result = setPlayerReady(room, socket.id)
    if (!result) return callback?.({ error: 'Round data not found' })

    callback?.({ success: true })

    // Broadcast ready count to all players in room
    io.to(room.roomCode).emit('ready-update', {
      readyCount: result.readyCount,
      totalCount: result.totalCount,
      readyPlayerIds: room.roundData.readyPlayers,
    })

    console.log(`✅ ${socket.id} ready (${result.readyCount}/${result.totalCount}) in ${room.roomCode}`)

    // If all ready, move to clue round placeholder
    if (result.allReady) {
      room.gameState = 'CLUE_ROUND'
      io.to(room.roomCode).emit('all-players-ready', {
        gameState: room.gameState,
        turnOrder: room.roundData.turnOrder,
        players: room.players.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.id === room.hostId,
        })),
      })
      console.log(`🚀 All ready in ${room.roomCode} — moving to CLUE_ROUND`)
    }
  })

  // ── Disconnect ───────────────────────────────────────────
  socket.on('disconnect', () => {
    handleDisconnect(socket)
    console.log(`💤 Disconnected: ${socket.id}`)
  })
})

function handleDisconnect(socket) {
  const result = leaveRoom(socket.id)
  if (!result) return

  const { roomCode, room, removedPlayerName } = result
  socket.leave(roomCode)

  if (room) {
    // If in reveal phase, check if remaining players are all ready
    if (room.gameState === 'REVEAL' && room.roundData) {
      // Remove disconnected player from ready list
      room.roundData.readyPlayers = room.roundData.readyPlayers.filter(id => id !== socket.id)
    }

    io.to(roomCode).emit('lobby-update', {
      players: room.players,
      hostId: room.hostId,
    })
    console.log(`👋 ${removedPlayerName} left room ${roomCode}`)
  } else {
    console.log(`🗑️  Room ${roomCode} deleted (empty)`)
  }
}

server.listen(PORT, () => {
  console.log(`\n🚀 SusWord server running on http://localhost:${PORT}\n`)
})
