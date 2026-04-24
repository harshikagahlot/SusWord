// Mock game logic — separated from UI so backend can replace this later
import { WORD_PAIRS } from '@shared/wordPairs'
import { PLAYER_ROLES, ROOM_CODE_LENGTH } from '@shared/constants'

const MOCK_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George']

const MOCK_CLUES = [
  'Reminds me of something outdoors',
  'I have seen this in daily life',
  'It is pretty common honestly',
  'You would find this near people',
  'Feels very familiar to me',
  'This is an easy one I think',
  'I associate this with weekends',
]

/**
 * Generate a random room code (4-char uppercase).
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * Create the host player + mock players for local testing.
 */
export function createMockPlayers(hostName, mockCount = 3) {
  const host = {
    id: 'player-0',
    name: hostName,
    role: null,
    word: null,
    clue: null,
    vote: null,
    isHost: true,
  }

  const shuffled = [...MOCK_NAMES].sort(() => Math.random() - 0.5)
  const mocks = shuffled.slice(0, mockCount).map((name, i) => ({
    id: `player-${i + 1}`,
    name,
    role: null,
    word: null,
    clue: null,
    vote: null,
    isHost: false,
  }))

  return [host, ...mocks]
}

/**
 * Assign roles and words for a new round.
 * Returns updated players array + roundData.
 */
export function assignRoles(players) {
  const wordPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)]
  const imposterIdx = Math.floor(Math.random() * players.length)

  const updatedPlayers = players.map((p, i) => ({
    ...p,
    role: i === imposterIdx ? PLAYER_ROLES.IMPOSTER : PLAYER_ROLES.CIVILIAN,
    word: i === imposterIdx ? wordPair.imposterWord : wordPair.mainWord,
    clue: null,
    vote: null,
  }))

  // Random turn order
  const turnOrder = updatedPlayers
    .map(p => p.id)
    .sort(() => Math.random() - 0.5)

  return {
    players: updatedPlayers,
    roundData: {
      wordPair,
      imposterId: updatedPlayers[imposterIdx].id,
      turnOrder,
      currentTurnIdx: 0,
      votes: {},
      votedOutId: null,
      voteTally: null,
      finalGuess: null,
      winner: null,
    },
  }
}

/**
 * Generate a random mock clue for an AI player.
 */
export function generateMockClue() {
  return MOCK_CLUES[Math.floor(Math.random() * MOCK_CLUES.length)]
}

/**
 * Generate random votes for all mock players (excludes the real user).
 */
export function generateMockVotes(players, realPlayerId) {
  const votes = {}
  players.forEach(p => {
    if (p.id === realPlayerId) return // user votes manually
    const targets = players.filter(t => t.id !== p.id)
    const target = targets[Math.floor(Math.random() * targets.length)]
    votes[p.id] = target.id
  })
  return votes
}

/**
 * Count votes and determine who is voted out.
 * Ties broken by random pick among tied players.
 */
export function resolveVotes(votes) {
  const tally = {}
  Object.values(votes).forEach(targetId => {
    tally[targetId] = (tally[targetId] || 0) + 1
  })

  const maxVotes = Math.max(...Object.values(tally))
  const tied = Object.keys(tally).filter(id => tally[id] === maxVotes)
  const votedOutId = tied[Math.floor(Math.random() * tied.length)]

  return { votedOutId, tally }
}

/**
 * Check if the imposter's final guess matches the main word.
 */
export function checkFinalGuess(guess, mainWord) {
  return guess.trim().toLowerCase() === mainWord.trim().toLowerCase()
}
