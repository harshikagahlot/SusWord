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
  const { state } = useGame()
  const Screen = screens[state.gameState] || Home

  return (
    <div className="w-full min-h-screen p-4 flex items-center justify-center">
      <div className="screen-enter w-full max-w-md mx-auto" key={state.gameState}>
        <Screen />
      </div>
    </div>
  )
}
