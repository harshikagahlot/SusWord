import { useState } from 'react'
import { useGame } from '../context/GameContext'
import Card3D from '../components/Card3D'

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

      {/* Single Unified Reveal Card */}
      <button
        id="word-card"
        onClick={() => setIsFlipped(true)}
        disabled={isFlipped}
        className={`relative mx-auto w-full max-w-xs p-8 rounded-[2rem] transition-all duration-500 ease-out flex flex-col items-center justify-center min-h-[240px] focus:outline-none ${
          !isFlipped 
            ? 'bg-gradient-to-br from-slate-800 to-black border border-slate-700 shadow-[0_0_25px_rgba(255,255,255,0.03)] hover:scale-105 active:scale-95 cursor-pointer hover:shadow-[0_0_35px_rgba(255,255,255,0.08)]'
            : 'bg-gradient-to-br from-slate-900 to-black border border-accent/30 shadow-[0_0_40px_rgba(163,230,53,0.15)] scale-100 cursor-default'
        }`}
        style={{ touchAction: 'manipulation' }}
      >
        {!isFlipped ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="text-7xl mb-5 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] animate-pulse">🔒</div>
            <p className="text-white font-extrabold text-xl tracking-wide mb-1">Tap to reveal</p>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">(Keep it a secret!)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in zoom-in-[0.85] fade-in duration-500">
            <p className="text-accent/80 text-xs uppercase tracking-[0.25em] mb-4 font-bold drop-shadow-[0_0_5px_rgba(163,230,53,0.5)]">
              Your Word
            </p>
            <p className="text-5xl font-black text-white tracking-tight mb-5 drop-shadow-[0_0_35px_rgba(163,230,53,0.6)] animate-in slide-in-from-bottom-2 duration-500">
              {myWord}
            </p>
            <div className="h-px w-16 bg-slate-700 mb-4 rounded-full"></div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
              Memorize it. Do not say it aloud.
            </p>
          </div>
        )}
      </button>

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
