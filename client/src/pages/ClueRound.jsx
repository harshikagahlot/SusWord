import { useState } from 'react'
import { useGame } from '../context/GameContext'

export default function ClueRound() {
  const { state, actions } = useGame()
  const { players, currentPlayerId, roundData } = state
  const { turnOrder, currentTurnIdx, currentTurnPlayerId, clues, clueRoundComplete } = roundData || {}

  const [clueInput, setClueInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isMyTurn = currentTurnPlayerId === currentPlayerId
  const currentTurnPlayer = players.find(p => p.id === currentTurnPlayerId)

  const handleSubmit = () => {
    const trimmed = clueInput.trim()
    if (trimmed && isMyTurn && !submitted) {
      setSubmitted(true)
      actions.submitClue(trimmed)
      setClueInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  // Reset submitted when it's my turn (shouldn't normally re-trigger, safety net)
  if (isMyTurn && submitted) {
    setSubmitted(false)
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xs uppercase tracking-widest text-text-muted mb-1">
          Clue Round
        </h2>
        <p className="text-sm text-text-muted">
          {clueRoundComplete
            ? 'All clues submitted!'
            : `Turn ${(currentTurnIdx || 0) + 1} of ${turnOrder?.length || 0}`
          }
        </p>
      </div>

      {/* Whose turn it is */}
      {!clueRoundComplete && currentTurnPlayer && (
        <div className={`card-elevated text-center mb-5 ${
          isMyTurn
            ? 'border-accent/50'
            : ''
        }`}
          style={isMyTurn ? { boxShadow: '0 0 0 2px rgba(163,230,53,0.2), 0 4px 20px rgba(0,0,0,0.35)' } : {}}>
          <p className="text-text-muted text-xs mb-1">
            {isMyTurn ? "It's your turn!" : 'Waiting for...'}
          </p>
          <p className={`text-xl font-bold ${isMyTurn ? 'text-accent' : 'text-text-primary'}`}>
            {currentTurnPlayer.name}
            {isMyTurn && <span className="text-text-muted text-sm ml-1.5">(you)</span>}
          </p>
        </div>
      )}

      {/* Input (only on my turn) */}
      {isMyTurn && !submitted && (
        <div className="mb-5">
          <div className="flex gap-2 items-stretch">
            <input
              id="clue-input"
              type="text"
              className="input flex-1"
              placeholder="Type your clue..."
              value={clueInput}
              onChange={e => setClueInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={60}
              autoFocus
            />
            <button
              id="submit-clue-btn"
              className="btn btn-primary !w-auto px-5 flex-shrink-0"
              disabled={!clueInput.trim()}
              onClick={handleSubmit}
            >
              Send
            </button>
          </div>
          <p className="text-text-muted text-xs mt-2 text-center">
            Don't use your exact word!
          </p>
        </div>
      )}

      {/* After submitting, waiting for others */}
      {isMyTurn && submitted && (
        <div className="card-elevated text-center mb-5">
          <p className="text-accent text-sm animate-pulse">Submitted! Waiting for next player...</p>
        </div>
      )}

      {/* Clues collected so far */}
      {clues && clues.length > 0 && (
        <div className="mb-5">
          <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Clues so far</p>
          <div className="flex flex-col gap-2">
            {clues.map((c, i) => (
              <div key={i} className="card tap-row py-3 px-4">
                <p className="text-xs text-text-muted mb-0.5">{c.playerName}</p>
                <p className="text-sm font-medium">"{c.clue}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-transition message */}
      {clueRoundComplete && (
        <div className="text-center text-text-muted text-sm animate-pulse py-2">
          Moving to voting...
        </div>
      )}
    </div>
  )
}
