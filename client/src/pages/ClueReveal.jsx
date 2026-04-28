import { useGame } from '../context/GameContext'

export default function ClueReveal() {
  const { state, actions } = useGame()
  const { players, currentPlayerId, roundData } = state
  const { clues } = roundData || {}

  const currentPlayer = players.find(p => p.id === currentPlayerId)
  const isHost = currentPlayer?.isHost

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-danger drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] mb-2">
          Clue Log
        </h2>
        <p className="text-sm text-text-muted italic">
          Read carefully. One of them is bluffing.
        </p>
      </div>

      {/* Clues List */}
      <div className="flex flex-col gap-3 mb-8">
        {clues && clues.length > 0 ? (
          clues.map((c, i) => (
            <div 
              key={i} 
              className="card py-4 px-5 border-l-4 border-l-danger/70 bg-surface-light/50 hover:bg-surface-light hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-danger/10 group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="text-xs text-danger uppercase tracking-widest font-bold mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {c.playerName}
              </p>
              <p className="text-lg font-medium text-text-primary">
                {c.clue ? `"${c.clue}"` : <span className="text-text-muted italic">[No clue submitted]</span>}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-text-muted italic py-4">No clues found...</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        {isHost ? (
          <button
            className="btn bg-danger hover:bg-danger/90 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all w-full"
            onClick={actions.continueToVoting}
          >
            ▶ Continue to Voting
          </button>
        ) : (
          <div className="text-center text-text-muted text-sm py-3 animate-pulse">
            Waiting for host to continue...
          </div>
        )}
      </div>
    </div>
  )
}
