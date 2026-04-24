import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { generateMockClue } from '../mock/gameLogic'

export default function ClueRound() {
  const { state, actions } = useGame()
  const { players, currentPlayerId, roundData } = state
  const { turnOrder, currentTurnIdx } = roundData

  const [clueInput, setClueInput] = useState('')

  const allDone = currentTurnIdx >= turnOrder.length
  const currentTurnPlayerId = allDone ? null : turnOrder[currentTurnIdx]
  const isMyTurn = currentTurnPlayerId === currentPlayerId
  const currentTurnPlayer = players.find(p => p.id === currentTurnPlayerId)

  // Get clues in order they were submitted
  const submittedClues = turnOrder.slice(0, currentTurnIdx).map(id => {
    const player = players.find(p => p.id === id)
    return { name: player?.name, clue: player?.clue, id }
  })

  // Auto-submit mock player clues after a short delay
  useEffect(() => {
    if (allDone || isMyTurn || !currentTurnPlayerId) return

    const timer = setTimeout(() => {
      const mockClue = generateMockClue()
      actions.submitClue(currentTurnPlayerId, mockClue)
    }, 800)

    return () => clearTimeout(timer)
  }, [currentTurnIdx, allDone, isMyTurn, currentTurnPlayerId])

  const handleSubmit = () => {
    if (clueInput.trim() && isMyTurn) {
      actions.submitClue(currentPlayerId, clueInput.trim())
      setClueInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xs uppercase tracking-widest text-text-muted mb-1">
          Clue Round
        </h2>
        <p className="text-sm text-text-muted">
          {allDone
            ? 'All clues submitted!'
            : `Turn ${currentTurnIdx + 1} of ${turnOrder.length}`
          }
        </p>
      </div>

      {/* Turn indicator */}
      {!allDone && currentTurnPlayer && (
        <div className={`card-elevated text-center mb-5 ${
          isMyTurn ? 'border-accent/50' : ''
        }`}>
          <p className="text-text-muted text-xs mb-1">
            {isMyTurn ? "It's your turn!" : 'Waiting for...'}
          </p>
          <p className={`text-xl font-bold ${isMyTurn ? 'text-accent' : 'text-text-primary'}`}>
            {currentTurnPlayer.name}
            {isMyTurn && <span className="text-text-muted text-sm ml-1.5">(you)</span>}
          </p>
        </div>
      )}

      {/* Clue input (only on my turn) */}
      {isMyTurn && (
        <div className="mb-5">
          <div className="flex gap-2">
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
              className="btn btn-primary !w-auto px-5"
              disabled={!clueInput.trim()}
              onClick={handleSubmit}
            >
              Send
            </button>
          </div>
          <p className="text-text-muted text-xs mt-1.5">
            Don't use your exact word!
          </p>
        </div>
      )}

      {/* Submitted clues list */}
      {submittedClues.length > 0 && (
        <div className="mb-5">
          <p className="text-text-muted text-xs uppercase tracking-widest mb-2">
            Clues so far
          </p>
          <div className="flex flex-col gap-2">
            {submittedClues.map(({ name, clue, id }) => (
              <div key={id} className="card py-2.5 px-4">
                <p className="text-xs text-text-muted mb-0.5">{name}</p>
                <p className="text-sm font-medium">"{clue}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proceed to voting */}
      {allDone && (
        <button
          id="go-to-voting-btn"
          className="btn btn-primary"
          onClick={actions.goToVoting}
        >
          → Proceed to Voting
        </button>
      )}
    </div>
  )
}
