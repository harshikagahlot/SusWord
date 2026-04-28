import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'

export default function ClueRound() {
  const { state, actions } = useGame()
  const { currentPlayerId, roundData } = state
  const { clueEndTime, submittedCount, totalCount, submittedPlayerIds } = roundData || {}

  const [clueInput, setClueInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  // Countdown timer logic
  useEffect(() => {
    if (!clueEndTime) return

    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((clueEndTime - now) / 1000))
      setTimeLeft(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [clueEndTime])

  // Check if current player already submitted (reconnect safety)
  useEffect(() => {
    if (submittedPlayerIds?.includes(currentPlayerId)) {
      setSubmitted(true)
    }
  }, [submittedPlayerIds, currentPlayerId])

  const handleSubmit = () => {
    const trimmed = clueInput.trim()
    if (trimmed && !submitted && timeLeft > 0) {
      setSubmitted(true)
      actions.submitClue(trimmed)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const allSubmitted = submittedCount >= totalCount

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xs uppercase tracking-widest text-text-muted mb-1">
          Clue Phase
        </h2>
        <p className="text-sm text-text-muted">
          All players write simultaneously
        </p>
      </div>

      {/* Timer and Progress */}
      <div className="card-elevated text-center mb-6">
        <div className="flex items-center justify-between px-4">
          <div className="text-left">
            <p className="text-xs text-text-muted mb-1">Time Left</p>
            <p className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-danger animate-pulse' : 'text-text-primary'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted mb-1">Progress</p>
            <p className="text-lg font-medium text-accent">
              {submittedCount || 0} / {totalCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      {!submitted && !allSubmitted && timeLeft > 0 ? (
        <div className="mb-5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex gap-2 mb-2">
            <input
              id="clue-input"
              type="text"
              className="input flex-1"
              placeholder="Type your clue..."
              value={clueInput}
              onChange={e => setClueInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={40}
              autoFocus
            />
            <button
              id="submit-clue-btn"
              className="btn btn-primary !w-auto px-5"
              disabled={!clueInput.trim()}
              onClick={handleSubmit}
            >
              Send
            </button>
          </div>
          <p className="text-text-muted text-xs text-center">
            Don't use your exact word! If time runs out, you lose your turn.
          </p>
        </div>
      ) : (
        <div className="card-elevated text-center mb-5 border-accent/40 bg-accent/5 animate-in fade-in zoom-in-95">
          <p className="text-accent font-medium mb-1">
            {allSubmitted ? "Everyone submitted!" : "Submitted ✓"}
          </p>
          <p className="text-sm text-text-muted">
            {allSubmitted ? "Waiting for reveal..." : "Waiting for other players..."}
          </p>
        </div>
      )}
    </div>
  )
}
