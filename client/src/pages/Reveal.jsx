import { useState } from 'react'
import { useGame } from '../context/GameContext'

const WORD_DICTIONARY = {
  "apple": { emoji: "🍎", meaning: "A sweet red or green fruit" },
  "banana": { emoji: "🍌", meaning: "A long curved yellow fruit" },
  "pizza": { emoji: "🍕", meaning: "A flat round dough baked with cheese" },
  "cat": { emoji: "🐱", meaning: "A small domesticated feline" },
  "dog": { emoji: "🐶", meaning: "A domesticated canine" },
  "car": { emoji: "🚗", meaning: "A four-wheeled road vehicle" },
  "hospital": { emoji: "🏥", meaning: "An institution providing medical treatment" },
  "school": { emoji: "🏫", meaning: "An institution for educating students" },
  "teacher": { emoji: "👨‍🏫", meaning: "A person who teaches in a school" },
  "doctor": { emoji: "👨‍⚕️", meaning: "A qualified practitioner of medicine" },
  "ocean": { emoji: "🌊", meaning: "A very large expanse of sea" },
  "mountain": { emoji: "⛰️", meaning: "A large natural elevation of the earth" },
  "computer": { emoji: "💻", meaning: "An electronic device for processing data" },
  "phone": { emoji: "📱", meaning: "A portable communication device" },
  "sun": { emoji: "☀️", meaning: "The star around which the earth orbits" },
  "moon": { emoji: "🌙", meaning: "The natural satellite of the earth" },
}

export default function Reveal() {
  const { state, actions } = useGame()
  const { myWord, readyCount, totalCount, readyPlayerIds } = state
  const [revealStage, setRevealStage] = useState('locked') // 'locked' | 'anticipating' | 'revealed'
  const [isReady, setIsReady] = useState(false)

  const wordInfo = WORD_DICTIONARY[myWord?.toLowerCase()] || null

  const handleReveal = () => {
    if (revealStage !== 'locked') return
    // Phase 1: Anticipation
    setRevealStage('anticipating')
    // Phase 2: Burst Reveal
    setTimeout(() => {
      setRevealStage('revealed')
    }, 200)
  }

  const handleReadyClick = () => {
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
        onClick={handleReveal}
        disabled={revealStage !== 'locked'}
        className={`relative mx-auto w-full max-w-xs p-8 rounded-[2rem] transition-all duration-300 ease-out flex flex-col items-center justify-center min-h-[240px] focus:outline-none ${
          revealStage === 'locked' 
            ? 'bg-gradient-to-br from-slate-800 to-black border border-slate-700 shadow-[0_0_25px_rgba(255,255,255,0.03)] hover:scale-[1.02] active:scale-[0.96] cursor-pointer hover:shadow-[0_0_35px_rgba(255,255,255,0.08)]'
            : revealStage === 'anticipating'
            ? 'bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-500 scale-[1.04] shadow-[0_0_40px_rgba(255,255,255,0.15)] cursor-default'
            : 'bg-gradient-to-br from-slate-900 to-black border border-accent/40 shadow-[0_0_45px_rgba(163,230,53,0.18)] scale-100 cursor-default animate-glow-pulse'
        }`}
        style={{ touchAction: 'manipulation' }}
      >
        {revealStage === 'locked' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="text-7xl mb-5 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] animate-pulse">🔒</div>
            <p className="text-white font-extrabold text-xl tracking-wide mb-1">Tap to reveal</p>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">(Keep it a secret!)</p>
          </div>
        )}

        {revealStage === 'anticipating' && (
          <div className="w-full h-full flex items-center justify-center absolute inset-0">
            <div className="w-20 h-20 rounded-full bg-white/20 blur-2xl animate-pulse"></div>
          </div>
        )}

        {revealStage === 'revealed' && (
          <div className="flex flex-col items-center w-full">
            <p className="text-accent/80 text-xs uppercase tracking-[0.25em] mb-2 font-bold drop-shadow-[0_0_5px_rgba(163,230,53,0.5)] opacity-0 animate-[fade-in_0.3s_ease-out_forwards]">
              Your Word
            </p>

            <div className="flex flex-col items-center justify-center min-h-[120px] animate-float">
              {/* Layer 1: Main Word (Instant Burst) */}
              <p className="text-5xl font-black text-white tracking-tight drop-shadow-[0_0_35px_rgba(163,230,53,0.6)] opacity-0 animate-burst">
                {myWord}
              </p>

              {/* Layer 2: Emoji (Bounce Delay) */}
              {wordInfo && (
                <div className="text-4xl mt-3 opacity-0 animate-bounce-pop drop-shadow-xl" style={{ animationDelay: '150ms' }}>
                  {wordInfo.emoji}
                </div>
              )}
            </div>

            <div className="h-px w-full max-w-[120px] bg-slate-700/60 my-4 rounded-full opacity-0 animate-[fade-in_0.3s_ease-out_forwards]" style={{ animationDelay: '300ms' }}></div>

            {/* Layer 3: Meaning (Fade Delay) */}
            {wordInfo ? (
              <p className="text-slate-300 text-[13px] font-medium tracking-wide text-center px-2 opacity-0 animate-[fade-in_0.4s_ease-out_forwards]" style={{ animationDelay: '400ms' }}>
                {wordInfo.meaning}
              </p>
            ) : (
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest opacity-0 animate-[fade-in_0.4s_ease-out_forwards]" style={{ animationDelay: '400ms' }}>
                Memorize it. Do not say it aloud.
              </p>
            )}
          </div>
        )}
      </button>

      {/* Ready button (only after card flip) */}
      {revealStage === 'revealed' && !isReady && (
        <button
          id="ready-btn"
          className="btn btn-primary"
          onClick={handleReadyClick}
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
