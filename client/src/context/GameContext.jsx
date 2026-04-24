import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { GAME_STATES, PLAYER_ROLES } from '@shared/constants'
import { getSocket, connectSocket, disconnectSocket } from '../hooks/useSocket'
import * as gameLogic from '../mock/gameLogic'

const GameContext = createContext(null)

const initialState = {
  gameState: GAME_STATES.HOME,
  room: null,
  players: [],
  currentPlayerId: null,
  roundData: null,
  myWord: null,
  readyCount: 0,
  totalCount: 0,
  readyPlayerIds: [],
  error: null,
}

function gameReducer(state, action) {
  switch (action.type) {
    // ── Room / Lobby ───────────────────────────────────────
    case 'ROOM_JOINED':
      return {
        ...state,
        gameState: GAME_STATES.LOBBY,
        room: { roomCode: action.roomCode },
        players: action.players,
        currentPlayerId: action.playerId,
        error: null,
      }

    case 'LOBBY_UPDATE':
      return {
        ...state,
        players: action.players.map(p => ({
          ...p,
          isHost: p.id === action.hostId,
        })),
      }

    case 'SET_ERROR':
      return { ...state, error: action.error }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    // ── Game Start + Reveal (Phase 4 — real server data) ───
    case 'GAME_STARTED':
      return {
        ...state,
        gameState: GAME_STATES.REVEAL,
        myWord: action.word,
        players: action.players,
        readyCount: 0,
        totalCount: action.players.length,
        readyPlayerIds: [],
        error: null,
      }

    case 'READY_UPDATE':
      return {
        ...state,
        readyCount: action.readyCount,
        totalCount: action.totalCount,
        readyPlayerIds: action.readyPlayerIds,
      }

    case 'ALL_PLAYERS_READY':
      return {
        ...state,
        gameState: GAME_STATES.CLUE_ROUND,
        roundData: {
          turnOrder: action.turnOrder,
          currentTurnIdx: 0,
        },
        players: action.players.map(p => ({
          ...p,
          clue: null,
          vote: null,
        })),
      }

    // ── Game round (mock for now — Phase 5 will replace) ───
    case 'GO_TO_CLUES':
      return { ...state, gameState: GAME_STATES.CLUE_ROUND }

    case 'SUBMIT_CLUE': {
      const newPlayers = state.players.map(p =>
        p.id === action.playerId ? { ...p, clue: action.clue } : p
      )
      return {
        ...state,
        players: newPlayers,
        roundData: {
          ...state.roundData,
          currentTurnIdx: state.roundData.currentTurnIdx + 1,
        },
      }
    }

    case 'GO_TO_VOTING':
      return { ...state, gameState: GAME_STATES.VOTING }

    case 'RESOLVE_VOTES':
      return {
        ...state,
        gameState: GAME_STATES.RESULT,
        roundData: {
          ...state.roundData,
          votes: action.allVotes,
          votedOutId: action.votedOutId,
          voteTally: action.tally,
          winner: action.winner,
        },
      }

    case 'SUBMIT_FINAL_GUESS':
      return {
        ...state,
        roundData: {
          ...state.roundData,
          finalGuess: action.guess,
          winner: action.winner,
        },
      }

    case 'RESTART_ROUND': {
      const resetPlayers = state.players.map(p => ({
        ...p,
        role: null,
        word: null,
        clue: null,
        vote: null,
      }))
      const { players, roundData } = gameLogic.assignRoles(resetPlayers)
      return {
        ...state,
        gameState: GAME_STATES.REVEAL,
        players,
        roundData,
        myWord: null,
      }
    }

    case 'LEAVE_ROOM':
      return { ...initialState }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // ── Listen for socket events ─────────────────────────────
  useEffect(() => {
    const socket = getSocket()

    const handleLobbyUpdate = ({ players, hostId }) => {
      dispatch({
        type: 'LOBBY_UPDATE',
        players,
        hostId,
      })
    }

    // Phase 4: receive PRIVATE word data from server
    const handleGameStarted = ({ word, players, gameState }) => {
      dispatch({
        type: 'GAME_STARTED',
        word,
        players,
      })
    }

    const handleReadyUpdate = ({ readyCount, totalCount, readyPlayerIds }) => {
      dispatch({ type: 'READY_UPDATE', readyCount, totalCount, readyPlayerIds })
    }

    const handleAllReady = ({ gameState, turnOrder, players }) => {
      dispatch({ type: 'ALL_PLAYERS_READY', turnOrder, players })
    }

    socket.on('lobby-update', handleLobbyUpdate)
    socket.on('game-started', handleGameStarted)
    socket.on('ready-update', handleReadyUpdate)
    socket.on('all-players-ready', handleAllReady)

    return () => {
      socket.off('lobby-update', handleLobbyUpdate)
      socket.off('game-started', handleGameStarted)
      socket.off('ready-update', handleReadyUpdate)
      socket.off('all-players-ready', handleAllReady)
    }
  }, [])

  // ── Action creators ──────────────────────────────────────
  const actions = {
    createRoom: useCallback(async (playerName) => {
      const socket = await connectSocket()
      socket.emit('create-room', { playerName }, (response) => {
        if (response.error) {
          dispatch({ type: 'SET_ERROR', error: response.error })
          return
        }
        dispatch({
          type: 'ROOM_JOINED',
          roomCode: response.roomCode,
          playerId: response.playerId,
          players: response.players.map(p => ({
            ...p,
            isHost: p.id === response.hostId,
          })),
        })
      })
    }, []),

    joinRoom: useCallback(async (playerName, roomCode) => {
      const socket = await connectSocket()
      socket.emit('join-room', { roomCode, playerName }, (response) => {
        if (response.error) {
          dispatch({ type: 'SET_ERROR', error: response.error })
          return
        }
        dispatch({
          type: 'ROOM_JOINED',
          roomCode: response.roomCode,
          playerId: response.playerId,
          players: response.players.map(p => ({
            ...p,
            isHost: p.id === response.hostId,
          })),
        })
      })
    }, []),

    startGame: useCallback(() => {
      const socket = getSocket()
      socket.emit('start-game', (response) => {
        if (response?.error) {
          dispatch({ type: 'SET_ERROR', error: response.error })
        }
      })
    }, []),

    // Phase 4: tell server this player has viewed their card
    markReady: useCallback(() => {
      const socket = getSocket()
      socket.emit('player-ready', (response) => {
        if (response?.error) {
          dispatch({ type: 'SET_ERROR', error: response.error })
        }
      })
    }, []),

    leaveRoom: useCallback(() => {
      const socket = getSocket()
      socket.emit('leave-room')
      disconnectSocket()
      dispatch({ type: 'LEAVE_ROOM' })
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: 'CLEAR_ERROR' })
    }, []),

    // ── Mock game actions (still local until Phase 5) ──────
    goToClues: () => dispatch({ type: 'GO_TO_CLUES' }),

    submitClue: (playerId, clue) => {
      dispatch({ type: 'SUBMIT_CLUE', playerId, clue })
    },

    goToVoting: () => dispatch({ type: 'GO_TO_VOTING' }),

    resolveVotes: (userVoteTargetId) => {
      const mockVotes = gameLogic.generateMockVotes(state.players, state.currentPlayerId)
      const allVotes = {
        ...mockVotes,
        [state.currentPlayerId]: userVoteTargetId,
      }
      const { votedOutId, tally } = gameLogic.resolveVotes(allVotes)
      const votedOutPlayer = state.players.find(p => p.id === votedOutId)
      const imposterCaught = votedOutPlayer?.role === PLAYER_ROLES.IMPOSTER
      const winner = imposterCaught ? null : 'IMPOSTER'
      dispatch({ type: 'RESOLVE_VOTES', allVotes, votedOutId, tally, winner })
    },

    submitFinalGuess: (guess) => {
      const correct = gameLogic.checkFinalGuess(
        guess,
        state.roundData.wordPair.mainWord
      )
      dispatch({
        type: 'SUBMIT_FINAL_GUESS',
        guess,
        winner: correct ? 'IMPOSTER' : 'CIVILIANS',
      })
    },

    restartRound: () => dispatch({ type: 'RESTART_ROUND' }),
  }

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}
