import { useGame } from '../context/GameContext'
import Card3D from '../components/Card3D'

export default function ClueReveal() {
  const { state, actions } = useGame()
  const { players, currentPlayerId, roundData } = state
  const { clues } = roundData || {}

  const currentPlayer = players.find(p => p.id === currentPlayerId)
  const isHost = currentPlayer?.isHost || players.find(p => p.isHost)?.id === currentPlayerId

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
            <Card3D
              key={i}
              className="flex items-center gap-3.5 group px-4 py-3.5"
              style={{
                animationDelay: `${i * 100}ms`,
                background: 'linear-gradient(135deg, rgba(244,63,94,0.08), rgba(244,63,94,0.02))',
                border: '1px solid rgba(244,63,94,0.2)',
                borderLeft: '4px solid rgba(244,63,94,0.7)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                style={{
                  background: 'rgba(244,63,94,0.15)',
                  color: 'var(--color-danger)',
                }}
              >
                {c.playerName[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-danger uppercase tracking-widest font-bold mb-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  {c.playerName}
                </p>
                <p className="text-[15px] font-semibold text-text-primary truncate">
                  {c.clue ? `"${c.clue}"` : <span className="text-text-muted italic">[No clue submitted]</span>}
                </p>
              </div>
            </Card3D>
          ))
        ) : (
          <p className="text-center text-text-muted italic py-4">No clues found...</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        {isHost ? (
          <button
            className="btn bg-danger text-white w-full"
            style={{ boxShadow: '0 0 15px rgba(239,68,68,0.3)' }}
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
