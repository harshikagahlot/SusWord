import { createContext, useContext, useReducer } from 'react'
import { GAME_STATES, PLAYER_ROLES } from '@shared/constants'
import * as gameLogic from '../mock/gameLogic'

const GameContext = createContext(null)

const initialState = {
  gameState: GAME_STATES.HOME,
  room: null,
  players: [],
  currentPlayerId: null,
  roundData: null,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'CREATE_ROOM':
      return {
        ...state,
        gameState: GAME_STATES.LOBBY,
        room: { roomCode: action.roomCode },
        players: action.players,
        currentPlayerId: action.currentPlayerId,
      }

    case 'START_GAME':
      return {
        ...state,
        gameState: GAME_STATES.REVEAL,
        players: action.players,
        roundData: action.roundData,
      }

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

  const actions = {
    createRoom: (playerName) => {
      const roomCode = gameLogic.generateRoomCode()
      const players = gameLogic.createMockPlayers(playerName, 3)
      dispatch({
        type: 'CREATE_ROOM',
        roomCode,
        players,
        currentPlayerId: 'player-0',
      })
    },

    joinRoom: (playerName, roomCode) => {
      // Mock mode: joining simulates creating with same code
      const players = gameLogic.createMockPlayers(playerName, 3)
      dispatch({
        type: 'CREATE_ROOM',
        roomCode: roomCode.toUpperCase(),
        players,
        currentPlayerId: 'player-0',
      })
    },

    startGame: () => {
      const { players, roundData } = gameLogic.assignRoles(state.players)
      dispatch({ type: 'START_GAME', players, roundData })
    },

    goToClues: () => dispatch({ type: 'GO_TO_CLUES' }),

    submitClue: (playerId, clue) => {
      dispatch({ type: 'SUBMIT_CLUE', playerId, clue })
    },

    goToVoting: () => dispatch({ type: 'GO_TO_VOTING' }),

    resolveVotes: (userVoteTargetId) => {
      // Generate mock votes + add user's vote
      const mockVotes = gameLogic.generateMockVotes(state.players, state.currentPlayerId)
      const allVotes = {
        ...mockVotes,
        [state.currentPlayerId]: userVoteTargetId,
      }
      const { votedOutId, tally } = gameLogic.resolveVotes(allVotes)
      const votedOutPlayer = state.players.find(p => p.id === votedOutId)
      const imposterCaught = votedOutPlayer?.role === PLAYER_ROLES.IMPOSTER

      // If imposter NOT caught → imposter wins immediately
      // If caught → winner is null until final guess
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
    leaveRoom: () => dispatch({ type: 'LEAVE_ROOM' }),
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
