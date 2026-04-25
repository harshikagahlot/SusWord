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
      <div className="flex flex-col gap-2 mb-6">
        {otherPlayers.map(player => {
          const isSelected = selectedId === player.id
          return (
            <button
              key={player.id}
              id={`vote-player-${player.id}`}
              disabled={hasVoted}
              onClick={() => !hasVoted && setSelectedId(player.id)}
              className={`card flex items-center gap-3 py-3 px-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-danger bg-danger/5'
                  : 'hover:border-text-muted/30'
              } ${hasVoted ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                isSelected
                  ? 'bg-danger/20 text-danger'
                  : 'bg-surface-light text-text-muted'
              }`}>
                {player.name[0].toUpperCase()}
              </div>
              <span className="font-medium flex-1">{player.name}</span>
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
        <div className="text-center text-text-muted text-sm animate-pulse">
          Counting votes... {votedCount} / {totalCount}
        </div>
      )}
    </div>
  )
}
