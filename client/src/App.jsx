import { useGame } from './context/GameContext'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Reveal from './pages/Reveal'
import ClueRound from './pages/ClueRound'
import Voting from './pages/Voting'
import Result from './pages/Result'

const screens = {
  HOME: Home,
  LOBBY: Lobby,
  REVEAL: Reveal,
  CLUE_ROUND: ClueRound,
  VOTING: Voting,
  RESULT: Result,
}

export default function App() {
  const { state, actions } = useGame()
  const Screen = screens[state.gameState] || Home

  return (
    <div className="w-full min-h-screen p-4 flex flex-col items-center justify-center">
      {state.error && (
        <div className="w-full max-w-md mx-auto mb-4 card border-danger/40 text-danger text-sm py-2.5 px-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span>{state.error}</span>
            <button onClick={actions.clearError} className="ml-2 hover:opacity-70 text-lg">×</button>
          </div>
        </div>
      )}
      <div className="screen-enter w-full max-w-md mx-auto" key={state.gameState}>
        <Screen />
      </div>
    </div>
  )
}
