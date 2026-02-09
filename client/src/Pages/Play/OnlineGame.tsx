import { useContext } from "react"
import { GameAndPlayers } from "./Game"
import { Panel } from "./Panel"
import { GameContext } from "../../Contexts/Game"
import { useNavigate } from "react-router-dom"

const Buttons = () => {
  const { resignGame, winner } = useContext(GameContext)
  const nav = useNavigate()
  return (
    <div id="lower-panel" className="flex flex-col gap-3">
      {
        winner == null ?
          <>
            <button onClick={() => resignGame()}>Resign</button>
          </> :
          <>
            <button onClick={() => nav("/play/matchmake-online")}>Play Again</button>
          </>
      }
    </div>
  )
}

export const OnlineGame = () => {
  const { playerColor } = useContext(GameContext)
  return (
    <div className="w-full flex items-center gap-2 justify-evenly">
      <GameAndPlayers />
      <Panel title="Online" game={true}>
        {
          playerColor != "v" ?
            <Buttons />
            : null
        }
      </Panel>
    </div>
  )
}
