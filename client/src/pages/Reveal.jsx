import { useState } from 'react'
import { useGame } from '../context/GameContext'

export default function Reveal() {
  const { state, actions } = useGame()
  const { myWord, readyCount, totalCount, readyPlayerIds } = state
  const [isFlipped, setIsFlipped] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const handleReady = () => {
    if (!isReady) {
      setIsReady(true)
      actions.markReady()
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-xs uppercase tracking-widest text-text-muted mb-2">
        Secret Word
      </h2>
      <p className="text-text-muted text-sm mb-6">
        Tap the card to reveal your word. Don't show anyone!
      </p>

      {/* Word card with flip animation */}
      <div
        id="word-card"
        className="word-card mx-auto mb-8 max-w-xs"
        onClick={() => setIsFlipped(true)}
      >
        <div className={`word-card-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front (hidden) */}
          <div className="word-card-front">
            <div className="text-5xl mb-3">🔒</div>
            <p className="text-text-muted font-medium">Tap to reveal</p>
            {!isFlipped && (
              <p className="text-text-muted text-xs mt-2 opacity-60">
                (tap anywhere on card)
              </p>
            )}
          </div>

          {/* Back (revealed) */}
          <div className="word-card-back">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-3">
              Your word is
            </p>
            <p className="text-4xl font-extrabold text-accent leading-tight"
               style={{ textShadow: '0 0 24px rgba(163,230,53,0.4)' }}>
              {myWord}
            </p>
            <p className="text-text-muted text-xs mt-4">
              Remember it. Don't say it directly.
            </p>
          </div>
        </div>
      </div>

      {/* Ready button (only after card flip) */}
      {isFlipped && !isReady && (
        <button
          id="ready-btn"
          className="btn btn-primary"
          onClick={handleReady}
        >
          ✓ I'm Ready
        </button>
      )}

      {/* Waiting state after marking ready */}
      {isReady && (
        <div className="card-elevated py-4 px-5">
          <p className="text-accent font-semibold mb-2">You're ready!</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <p className="text-text-muted text-sm">
              Waiting for others — {readyCount} / {totalCount} ready
            </p>
          </div>

          {/* Ready player indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            {state.players.map(p => (
              <div
                key={p.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  readyPlayerIds.includes(p.id)
                    ? 'bg-accent/20 text-accent scale-110'
                    : 'bg-surface-light text-text-muted opacity-40'
                }`}
                title={p.name}
              >
                {p.name[0].toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
