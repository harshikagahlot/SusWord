import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { MIN_PLAYERS, MAX_PLAYERS } from '@shared/constants'

export default function Lobby() {
  const { state, actions } = useGame()
  const [isStarting, setIsStarting] = useState(false)
  const { room, players, currentPlayerId } = state
  const currentPlayer = players.find(p => p.id === currentPlayerId)
  const isHost = currentPlayer?.isHost
  const canStart = players.length >= MIN_PLAYERS && !isStarting

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(room.roomCode)
  }

  const handleStart = () => {
    setIsStarting(true)
    actions.startGame()
    setTimeout(() => setIsStarting(false), 5000) // Fallback reset
  }

  return (
    <div>
      {/* Room code */}
      <div className="text-center mb-6">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">
          Room Code
        </p>
        <button
          id="room-code-display"
          onClick={handleCopyCode}
          className="text-4xl font-extrabold tracking-[0.25em] text-accent 
                     hover:text-[#bef264] transition-colors cursor-pointer bg-transparent border-none"
          title="Click to copy"
        >
          {room?.roomCode}
        </button>
        <p className="text-text-muted text-xs mt-1">Tap to copy</p>
      </div>

      {/* Player count */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Players</h2>
        <span className="badge badge-muted">
          {players.length} / {MAX_PLAYERS}
        </span>
      </div>

      {/* Player list */}
      <div className="flex flex-col gap-2 mb-6">
        {players.map(player => (
          <div
            key={player.id}
            id={`lobby-player-${player.id}`}
            className={`card flex items-center justify-between py-3 px-4 ${
              player.id === currentPlayerId
                ? 'border-accent/40'
                : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar circle */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                player.isHost
                  ? 'bg-accent/20 text-accent'
                  : 'bg-surface-light text-text-muted'
              }`}>
                {player.name[0].toUpperCase()}
              </div>
              <span className="font-medium">
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="text-text-muted text-xs ml-1.5">(you)</span>
                )}
              </span>
            </div>
            {player.isHost && (
              <span className="badge badge-accent">HOST</span>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {isHost && (
          <button
            id="start-game-btn"
            className="btn btn-primary"
            disabled={!canStart || isStarting}
            onClick={handleStart}
          >
            {isStarting 
              ? 'Starting...' 
              : canStart
                ? '▶ Start Game'
                : `Need ${MIN_PLAYERS - players.length} more player${MIN_PLAYERS - players.length !== 1 ? 's' : ''}`
            }
          </button>
        )}
        {!isHost && (
          <div className="text-center text-text-muted text-sm py-3">
            Waiting for host to start...
          </div>
        )}
        <button
          id="leave-room-btn"
          className="btn btn-danger"
          onClick={actions.leaveRoom}
        >
          ✕ Leave Room
        </button>
      </div>
    </div>
  )
}
