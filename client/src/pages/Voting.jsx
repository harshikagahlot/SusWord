import { useState } from 'react'
import { useGame } from '../context/GameContext'
import Card3D from '../components/Card3D'

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
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-semibold mb-1">
          Voting Round
        </p>
        <p className="text-sm text-text-muted">
          {hasVoted
            ? `Waiting for votes — ${votedCount} / ${totalCount}`
            : 'Who do you think is the imposter?'
          }
        </p>
      </div>

      {/* Player list */}
      <div className="flex flex-col gap-3 mb-6">
        {otherPlayers.map(player => {
          const isSelected = selectedId === player.id
          return (
            <Card3D
              as="button"
              key={player.id}
              id={`vote-player-${player.id}`}
              disabled={hasVoted}
              onClick={() => !hasVoted && setSelectedId(player.id)}
              className={`w-full flex items-center gap-3.5 text-left px-4 py-3.5 ${
                isSelected ? 'player-card--selected' : ''
              }`}
              style={
                isSelected
                  ? {}
                  : {
                      background: 'rgba(31,41,55,0.75)',
                      border: '1px solid rgba(55,65,81,0.8)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    }
              }
            >
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 transition-all duration-150"
                style={
                  isSelected
                    ? {
                        background: 'linear-gradient(135deg, rgba(244,63,94,0.3), rgba(244,63,94,0.1))',
                        color: 'var(--color-danger)',
                        border: '1.5px solid rgba(244,63,94,0.45)',
                        boxShadow: '0 0 14px rgba(244,63,94,0.2)',
                        transform: 'scale(1.08)',
                      }
                    : {
                        background: 'rgba(51,65,85,0.9)',
                        color: 'var(--color-text-muted)',
                        border: '1px solid rgba(71,85,105,0.5)',
                      }
                }
              >
                {player.name[0].toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate transition-colors duration-150 ${
                  isSelected ? 'text-danger' : 'text-text-primary'
                }`}>
                  {player.name}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {isSelected ? '⚠ Marked as suspect' : 'Tap to select'}
                </p>
              </div>

              {/* SUS badge */}
              {isSelected && (
                <div
                  className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest"
                  style={{
                    background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(244,63,94,0.05))',
                    color: 'var(--color-danger)',
                    border: '1px solid rgba(244,63,94,0.35)',
                  }}
                >
                  SUS
                </div>
              )}
            </Card3D>
          )
        })}
      </div>

      {/* Confirm vote button */}
      {!hasVoted && (
        <button
          id="confirm-vote-btn"
          disabled={!selectedId}
          onClick={handleVote}
          className="relative w-full rounded-2xl font-extrabold text-[15px] min-h-[56px] overflow-hidden transition-all duration-150 select-none"
          style={
            selectedId
              ? {
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: 'white',
                  boxShadow: '0 4px 24px rgba(244,63,94,0.35), 0 2px 8px rgba(0,0,0,0.2)',
                  WebkitTapHighlightColor: 'transparent',
                }
              : {
                  background: 'rgba(244,63,94,0.07)',
                  color: 'rgba(244,63,94,0.3)',
                  border: '1px solid rgba(244,63,94,0.12)',
                  cursor: 'not-allowed',
                }
          }
        >
          {selectedId && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }}
            />
          )}
          <span className="relative">
            {selectedId
              ? `🗳 Vote out ${players.find(p => p.id === selectedId)?.name}`
              : 'Select a player to vote'
            }
          </span>
        </button>
      )}

      {/* Waiting */}
      {hasVoted && (
        <div
          className="text-center py-4 rounded-2xl text-sm text-text-muted animate-pulse"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span className="mr-2">●</span>
          Counting votes... {votedCount} / {totalCount}
        </div>
      )}
    </div>
  )
}
