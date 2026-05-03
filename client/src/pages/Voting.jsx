import { useState } from 'react'
import { useGame } from '../context/GameContext'

export default function Voting() {
  const { state, actions } = useGame()
  const { players, currentPlayerId, roundData } = state
  const [selectedId, setSelectedId] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  const otherPlayers = players.filter(p => p.id !== currentPlayerId)
  const votedCount = roundData?.votedCount || 0
  const totalCount = roundData?.totalCount || players.length

  const handleVote = () => {
    if (selectedId && !hasVoted) {
      setHasVoted(true)
      actions.submitVote(selectedId)
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xs uppercase tracking-widest text-text-muted mb-1">
          Voting Round
        </h2>
        <p className="text-sm text-text-muted">
          {hasVoted
            ? `Waiting for votes — ${votedCount} / ${totalCount}`
            : 'Who do you think is the imposter?'
          }
        </p>
      </div>

      {/* Player grid */}
      <div className="flex flex-col gap-3 mb-6">
        {otherPlayers.map(player => {
          const isSelected = selectedId === player.id
          return (
            <button
              key={player.id}
              id={`vote-player-${player.id}`}
              disabled={hasVoted}
              onClick={() => !hasVoted && setSelectedId(player.id)}
              className={`card tap-row flex items-center gap-3 py-4 px-4 text-left transition-all ${
                isSelected
                  ? 'border-danger bg-danger/5 shadow-[0_0_0_2px_rgba(244,63,94,0.35)]'
                  : 'hover:border-text-muted/30'
              } ${hasVoted ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-150 ${
                isSelected
                  ? 'bg-danger/20 text-danger scale-110'
                  : 'bg-surface-light text-text-muted'
              }`}>
                {player.name[0].toUpperCase()}
              </div>
              <span className="font-medium flex-1 text-left">{player.name}</span>
              {isSelected && (
                <span className="badge badge-danger">SUS</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Vote button */}
      {!hasVoted && (
        <button
          id="confirm-vote-btn"
          className="btn btn-primary"
          disabled={!selectedId}
          onClick={handleVote}
          style={selectedId ? {
            backgroundColor: 'var(--color-danger)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
          } : {}}
        >
          {selectedId
            ? `🗳 Vote out ${players.find(p => p.id === selectedId)?.name}`
            : 'Select a player to vote'
          }
        </button>
      )}

      {/* Waiting indicator */}
      {hasVoted && (
        <div className="text-center text-text-muted text-sm animate-pulse py-2">
          Counting votes... {votedCount} / {totalCount}
        </div>
      )}
    </div>
  )
}
