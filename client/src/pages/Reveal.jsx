import { useState } from 'react'
import { useGame } from '../context/GameContext'

export default function Reveal() {
  const { state, actions } = useGame()
  const { players, currentPlayerId } = state
  const currentPlayer = players.find(p => p.id === currentPlayerId)
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="text-center">
      <h2 className="text-lg font-bold text-text-muted mb-2 uppercase tracking-widest text-xs">
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
          </div>

          {/* Back (revealed) */}
          <div className="word-card-back">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-2">
              Your word is
            </p>
            <p className="text-3xl font-extrabold text-accent">
              {currentPlayer?.word}
            </p>
            <p className="text-text-muted text-xs mt-3">
              Remember it. Don't say it directly.
            </p>
          </div>
        </div>
      </div>

      {/* Continue button (only after reveal) */}
      {isFlipped && (
        <button
          id="continue-to-clues-btn"
          className="btn btn-primary"
          onClick={actions.goToClues}
        >
          Got it → Start Clue Round
        </button>
      )}
    </div>
  )
}
