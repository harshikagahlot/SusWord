import { useState } from 'react'
import { useGame } from '../context/GameContext'
import Card3D from '../components/Card3D'

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
        <Card3D className="text-center mb-5 p-4"
          style={
            isMyTurn
              ? {
                  background: 'linear-gradient(135deg, rgba(163,230,53,0.1), rgba(163,230,53,0.02))',
                  border: '1.5px solid rgba(163,230,53,0.3)',
                  boxShadow: '0 0 20px rgba(163,230,53,0.12), 0 4px 16px rgba(0,0,0,0.3)',
                }
              : {
                  background: 'rgba(31,41,55,0.6)',
                  border: '1px solid rgba(55,65,81,0.6)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }
          }
        >
          <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted mb-1.5 font-bold">
            {isMyTurn ? "✦ It's your turn!" : 'Waiting for...'}
          </p>
          <p className={`text-2xl font-black ${isMyTurn ? 'text-accent' : 'text-text-primary'}`}>
            {currentTurnPlayer.name}
            {isMyTurn && <span className="text-text-muted text-sm ml-1.5 font-medium">(you)</span>}
          </p>
        </Card3D>
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
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-3 px-1">
            Clues so far
          </p>
          <div className="flex flex-col gap-2.5">
            {clues.map((c, i) => {
              return (
                <Card3D key={i} className="flex items-center gap-3.5 px-4 py-3.5"
                  style={{
                    background: 'rgba(31,41,55,0.7)',
                    border: '1px solid rgba(55,65,81,0.7)',
                    borderLeft: '4px solid rgba(163,230,53,0.5)',
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                    style={{
                      background: 'rgba(51,65,85,0.9)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {c.playerName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-accent/80 font-bold uppercase tracking-widest mb-0.5">
                      {c.playerName}
                    </p>
                    <p className="text-[15px] font-semibold text-text-primary truncate">
                      "{c.clue}"
                    </p>
                  </div>
                </Card3D>
              )
            })}
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
