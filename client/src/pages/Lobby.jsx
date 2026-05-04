import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { MIN_PLAYERS, MAX_PLAYERS } from '@shared/constants'
import Card3D from '../components/Card3D'

export default function Lobby() {
  const { state, actions } = useGame()
  const [isStarting, setIsStarting] = useState(false)
  const [copied, setCopied] = useState(false)
  const { room, players, currentPlayerId } = state
  const currentPlayer = players.find(p => p.id === currentPlayerId)
  const isHost = currentPlayer?.isHost
  const canStart = players.length >= MIN_PLAYERS && !isStarting

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(room.roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleStart = () => {
    setIsStarting(true)
    actions.startGame()
    setTimeout(() => setIsStarting(false), 5000)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Page heading ── */}
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-semibold">
          🎮 Game Lobby
        </p>
        <h1 className="text-2xl font-extrabold text-text-primary mt-1">
          <span className="text-accent">Sus</span>Word
        </h1>
      </div>

      {/* ── Room Code Block ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(163,230,53,0.07) 0%, rgba(163,230,53,0.02) 100%)',
          border: '1.5px solid rgba(163,230,53,0.22)',
          boxShadow: '0 0 40px rgba(163,230,53,0.07), 0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Ambient glow blob */}
        <div
          className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.1) 0%, transparent 70%)' }}
        />

        <div className="relative p-5 text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-accent/70 font-bold mb-3">
            Room Code
          </p>

          {/* Split letter boxes */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {(room?.roomCode ?? '----').split('').map((char, i) => (
              <div
                key={i}
                className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-extrabold text-accent"
                style={{
                  background: 'rgba(163,230,53,0.07)',
                  border: '1.5px solid rgba(163,230,53,0.22)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                  letterSpacing: 0,
                }}
              >
                {char}
              </div>
            ))}
          </div>

          {/* Copy button */}
          <button
            id="room-code-display"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 select-none"
            style={{
              background: copied ? 'rgba(163,230,53,0.14)' : 'rgba(255,255,255,0.04)',
              border: copied ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color: copied ? 'var(--color-accent)' : 'var(--color-text-muted)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {copied ? '✓ Copied!' : '⎘ Copy Code'}
          </button>
        </div>
      </div>

      {/* ── Player List ── */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted font-semibold">
            Players
          </p>
          <div
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={{
              background: 'rgba(163,230,53,0.1)',
              color: 'var(--color-accent)',
              border: '1px solid rgba(163,230,53,0.2)',
            }}
          >
            {players.length} / {MAX_PLAYERS}
          </div>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2.5">
          {players.map(player => {
            const isMe = player.id === currentPlayerId

            return (
              <Card3D
                key={player.id}
                id={`lobby-player-${player.id}`}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  background: isMe
                    ? 'linear-gradient(135deg, rgba(163,230,53,0.08), rgba(163,230,53,0.02))'
                    : 'rgba(31,41,55,0.7)',
                  border: isMe
                    ? '1.5px solid rgba(163,230,53,0.22)'
                    : '1px solid rgba(55,65,81,0.7)',
                  boxShadow: isMe
                    ? '0 2px 14px rgba(163,230,53,0.07)'
                    : '0 2px 8px rgba(0,0,0,0.18)',
                }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                  style={
                    player.isHost
                      ? {
                          background: 'linear-gradient(135deg, rgba(163,230,53,0.28), rgba(163,230,53,0.08))',
                          color: 'var(--color-accent)',
                          border: '1.5px solid rgba(163,230,53,0.35)',
                          boxShadow: '0 0 14px rgba(163,230,53,0.18)',
                        }
                      : {
                          background: 'rgba(51,65,85,0.9)',
                          color: 'var(--color-text-muted)',
                          border: '1px solid rgba(71,85,105,0.6)',
                        }
                  }
                >
                  {player.name[0].toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary truncate">
                    {player.name}
                    {isMe && (
                      <span className="ml-1.5 text-[10px] font-normal text-text-muted">(you)</span>
                    )}
                  </p>
                  {player.isHost && (
                    <p className="text-[10px] text-accent/60 font-medium uppercase tracking-wide mt-0.5">
                      Room Host
                    </p>
                  )}
                </div>

                {/* Host badge */}
                {player.isHost && (
                  <div
                    className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest"
                    style={{
                      background: 'linear-gradient(135deg, rgba(163,230,53,0.18), rgba(163,230,53,0.04))',
                      color: 'var(--color-accent)',
                      border: '1px solid rgba(163,230,53,0.28)',
                    }}
                  >
                    👑 HOST
                  </div>
                )}
              </Card3D>
            )
          })}
        </div>
      </div>

      {/* ── Waiting for more players ── */}
      {players.length < MIN_PLAYERS && (
        <div
          className="text-center py-3 px-4 rounded-xl text-xs text-text-muted"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(148,163,184,0.18)',
          }}
        >
          Waiting for {MIN_PLAYERS - players.length} more player{MIN_PLAYERS - players.length !== 1 ? 's' : ''} to join...
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col gap-3 pt-1">

        {/* Start Game button (host only) */}
        {isHost ? (
          <button
            id="start-game-btn"
            disabled={!canStart || isStarting}
            onClick={handleStart}
            className="relative w-full rounded-2xl font-extrabold text-[15px] min-h-[56px] overflow-hidden transition-all duration-150 select-none"
            style={
              canStart && !isStarting
                ? {
                    background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
                    color: '#0B1020',
                    boxShadow: '0 4px 28px rgba(163,230,53,0.32), 0 2px 8px rgba(0,0,0,0.2)',
                    WebkitTapHighlightColor: 'transparent',
                  }
                : {
                    background: 'rgba(163,230,53,0.08)',
                    color: 'rgba(163,230,53,0.3)',
                    border: '1px solid rgba(163,230,53,0.12)',
                    cursor: 'not-allowed',
                  }
            }
          >
            {/* Shine overlay */}
            {canStart && !isStarting && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)',
                }}
              />
            )}
            <span className="relative">
              {isStarting
                ? '⏳ Starting...'
                : canStart
                  ? '▶ Start Game'
                  : `Need ${MIN_PLAYERS - players.length} more player${MIN_PLAYERS - players.length !== 1 ? 's' : ''}`
              }
            </span>
          </button>
        ) : (
          <div
            className="text-center py-4 rounded-2xl text-sm text-text-muted"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span className="animate-pulse mr-2">●</span>
            Waiting for host to start...
          </div>
        )}

        {/* Leave Room */}
        <button
          id="leave-room-btn"
          onClick={actions.leaveRoom}
          className="w-full rounded-2xl min-h-[48px] text-sm font-semibold transition-all duration-150 select-none"
          style={{
            background: 'rgba(244,63,94,0.05)',
            color: 'var(--color-danger)',
            border: '1px solid rgba(244,63,94,0.18)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ✕ Leave Room
        </button>

      </div>
    </div>
  )
}
