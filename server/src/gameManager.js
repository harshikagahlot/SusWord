/**
 * Game manager — handles round creation, word assignment, and reveal readiness.
 * Keeps round data on the room object in memory.
 */

// ── Word pairs (small inline list for MVP) ─────────────────
const WORD_PAIRS = [
  { mainWord: 'Pizza', imposterWord: 'Burger', category: 'Food' },
  { mainWord: 'Doctor', imposterWord: 'Nurse', category: 'Jobs' },
  { mainWord: 'Ocean', imposterWord: 'Beach', category: 'Places' },
  { mainWord: 'Mango', imposterWord: 'Papaya', category: 'Food' },
  { mainWord: 'Guitar', imposterWord: 'Ukulele', category: 'Objects' },
  { mainWord: 'Dolphin', imposterWord: 'Whale', category: 'Animals' },
  { mainWord: 'Coffee', imposterWord: 'Espresso', category: 'Food' },
  { mainWord: 'Castle', imposterWord: 'Palace', category: 'Places' },
  { mainWord: 'Thunder', imposterWord: 'Lightning', category: 'Nature' },
  { mainWord: 'Painting', imposterWord: 'Drawing', category: 'Activities' },
  { mainWord: 'Jacket', imposterWord: 'Coat', category: 'Clothing' },
  { mainWord: 'Sunset', imposterWord: 'Sunrise', category: 'Nature' },
  { mainWord: 'Soup', imposterWord: 'Stew', category: 'Food' },
  { mainWord: 'Wolf', imposterWord: 'Fox', category: 'Animals' },
  { mainWord: 'Lake', imposterWord: 'Pond', category: 'Places' },
  { mainWord: 'Frog', imposterWord: 'Toad', category: 'Animals' },
  { mainWord: 'Sword', imposterWord: 'Dagger', category: 'Objects' },
  { mainWord: 'Jogging', imposterWord: 'Sprinting', category: 'Activities' },
  { mainWord: 'Pancake', imposterWord: 'Waffle', category: 'Food' },
  { mainWord: 'Hill', imposterWord: 'Mountain', category: 'Nature' },
]

/**
 * Start a new round for the given room.
 * Picks imposter, assigns words, stores round data on the room.
 * Returns the round data (server-side, contains all secrets).
 */
function startRound(room) {
  // Pick random word pair
  const wordPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)]

  // Pick random imposter
  const imposterIdx = Math.floor(Math.random() * room.players.length)
  const imposterId = room.players[imposterIdx].id

  // Build per-player assignments (private data, never broadcast)
  const assignments = {}
  room.players.forEach(p => {
    assignments[p.id] = {
      word: p.id === imposterId ? wordPair.imposterWord : wordPair.mainWord,
    }
  })

  // Random turn order for clue round (prepared now, used later)
  const turnOrder = room.players
    .map(p => p.id)
    .sort(() => Math.random() - 0.5)

  // Store round data on the room
  room.roundData = {
    wordPair,
    imposterId,
    assignments,
    turnOrder,
    readyPlayers: [],
  }

  // Update room state
  room.gameState = 'REVEAL'

  return room.roundData
}

/**
 * Get the PRIVATE reveal payload for a specific player.
 * Only contains their own word — no other player's data.
 */
function getPlayerRevealData(room, socketId) {
  const rd = room.roundData
  if (!rd || !rd.assignments[socketId]) return null

  return {
    word: rd.assignments[socketId].word,
    gameState: room.gameState,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.id === room.hostId,
    })),
  }
}

/**
 * Mark a player as ready after viewing their card.
 * Returns { allReady, readyCount, totalCount }
 */
function setPlayerReady(room, socketId) {
  const rd = room.roundData
  if (!rd) return null

  if (!rd.readyPlayers.includes(socketId)) {
    rd.readyPlayers.push(socketId)
  }

  const totalCount = room.players.length
  const readyCount = rd.readyPlayers.length
  const allReady = readyCount >= totalCount

  return { allReady, readyCount, totalCount }
}

module.exports = { startRound, getPlayerRevealData, setPlayerReady }
