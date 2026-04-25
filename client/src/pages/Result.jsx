import { useState } from 'react'
import { useGame } from '../context/GameContext'

export default function Result() {
  const { state, actions } = useGame()
  const { players, currentPlayerId, roundData } = state
  const {
    votedOutId, voteTally, winner, wordPair, imposterId,
    imposterCaught, finalGuess,
  } = roundData || {}

  const votedOutPlayer = players.find(p => p.id === votedOutId)
  const isCurrentPlayerImposter = currentPlayerId === imposterId
  const currentPlayer = players.find(p => p.id === currentPlayerId)
  const isHost = currentPlayer?.isHost

  // Final guess input
  const [guessInput, setGuessInput] = useState('')
  const [guessSubmitted, setGuessSubmitted] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)

  const needsFinalGuess = imposterCaught && winner === null
  const showFinalGuessInput = needsFinalGuess && isCurrentPlayerImposter && !guessSubmitted

  const handleGuess = () => {
    if (guessInput.trim()) {
      setGuessSubmitted(true)
      actions.submitFinalGuess(guessInput.trim())
    }
  }

  const handleRestart = () => {
    console.log('🔄 Requesting restart...')
    setIsRestarting(true)
    
    actions.restartRound((response) => {
      if (response?.error) {
        console.error('❌ Restart failed:', response.error)
        setIsRestarting(false)
      } else {
        console.log('✅ Restart command accepted by server')
      }
    })

    // Safety timeout to reset button if server hangs
    setTimeout(() => {
      setIsRestarting(prev => {
        if (prev) console.warn('⚠️ Restart timed out')
        return false
      })
    }, 5000)
  }

  const winnerLabel = winner === 'IMPOSTER' ? '🕵️ Imposter Wins!' : '🎉 Civilians Win!'
  const winnerColor = winner === 'IMPOSTER' ? 'text-danger' : 'text-accent'

  return (
    <div>
      {/* Winner announcement */}
      {winner && (
        <div className="text-center mb-6">
          <p className={`text-3xl font-extrabold ${winnerColor} mb-2`}>
            {winnerLabel}
          </p>
        </div>
      )}

      {/* Final guess (imposter caught, awaiting guess) */}
      {showFinalGuessInput && (
        <div className="card-elevated text-center mb-6 border-danger/40">
          <p className="text-danger font-bold text-lg mb-1">You were caught!</p>
          <p className="text-text-muted text-sm mb-4">
            Guess the main word to steal the win.
          </p>
          <div className="flex gap-2 mb-2">
            <input
              id="final-guess-input"
              type="text"
              className="input flex-1 text-center"
              placeholder="Guess the main word..."
              value={guessInput}
              onChange={e => setGuessInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGuess()}
              autoFocus
            />
            <button
              id="submit-guess-btn"
              className="btn btn-primary !w-auto px-5"
              disabled={!guessInput.trim()}
              onClick={handleGuess}
            >
              Guess
            </button>
          </div>
        </div>
      )}

      {/* Waiting for imposter guess */}
      {needsFinalGuess && !isCurrentPlayerImposter && (
        <div className="text-center mb-6 animate-pulse">
          <p className="text-text-muted">Imposter is making their final guess...</p>
        </div>
      )}

      {/* Result details (shown after winner is determined) */}
      {winner && (
        <>
          {/* Voted out info */}
          <div className="card-elevated mb-4 text-center">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-1">
              {votedOutId ? 'Voted Out' : 'Voting Result'}
            </p>
            <p className="text-xl font-bold">
              {votedOutId ? votedOutPlayer?.name : 'No one was eliminated! (Tie)'}
              {votedOutId && (
                <span className={`ml-2 badge ${imposterCaught ? 'badge-danger' : 'badge-muted'}`}>
                  {imposterCaught ? 'IMPOSTER' : 'CIVILIAN'}
                </span>
              )}
            </p>
            {finalGuess && (
              <p className="text-sm text-text-muted mt-2">
                Final guess: <span className="font-medium text-text-primary">"{finalGuess}"</span>
                {' '}
                <span className={finalGuess.toLowerCase().trim() === wordPair?.mainWord?.toLowerCase().trim() ? 'text-accent' : 'text-danger'}>
                  {finalGuess.toLowerCase().trim() === wordPair?.mainWord?.toLowerCase().trim() ? '✓ Correct!' : '✗ Wrong'}
                </span>
              </p>
            )}
          </div>

          {/* Words reveal */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="card text-center">
              <p className="text-text-muted text-xs mb-1">Main Word</p>
              <p className="text-lg font-bold text-accent">{wordPair?.mainWord}</p>
            </div>
            <div className="card text-center">
              <p className="text-text-muted text-xs mb-1">Imposter Word</p>
              <p className="text-lg font-bold text-danger">{wordPair?.imposterWord}</p>
            </div>
          </div>

          {/* All players */}
          <div className="mb-4">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-2">
              All Players
            </p>
            <div className="flex flex-col gap-1.5">
              {players.map(player => {
                const votesReceived = voteTally?.[player.id] || 0
                const isImposter = player.id === imposterId || player.isImposter
                return (
                  <div
                    key={player.id}
                    className={`card py-2.5 px-4 flex items-center justify-between ${
                      isImposter ? 'border-danger/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isImposter ? 'bg-danger/20 text-danger' : 'bg-accent/15 text-accent'
                      }`}>
                        {player.name[0]}
                      </div>
                      <span className="text-sm font-medium">
                        {player.name}
                        {player.id === currentPlayerId && (
                          <span className="text-text-muted text-xs ml-1">(you)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted text-xs">
                        {votesReceived} vote{votesReceived !== 1 ? 's' : ''}
                      </span>
                      <span className={`badge ${isImposter ? 'badge-danger' : 'badge-accent'}`}>
                        {isImposter ? 'SPY' : 'SAFE'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-6">
            {isHost ? (
              <button
                id="play-again-btn"
                className="btn btn-primary"
                onClick={handleRestart}
                disabled={isRestarting}
              >
                {isRestarting ? '⌛ Starting...' : '↻ Play Again'}
              </button>
            ) : (
              <div className="text-center text-text-muted text-sm py-2">
                Waiting for host to start next round...
              </div>
            )}
            <button
              id="leave-room-btn"
              className="btn btn-ghost"
              onClick={actions.leaveRoom}
            >
              ← Leave Room
            </button>
          </div>
        </>
      )}
    </div>
  )
}
