import { useContext, useEffect } from "react"
import { GameAndPlayers } from "./Game"
import { Panel } from "./Panel"
import { GameContext } from "../../Contexts/Game"
import { useNavigate } from "react-router-dom"
import { WsContext } from "../../Contexts/Ws"

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
            <button onClick={() => nav("/game/matchmake-online")}>Play Again</button>
          </>
      }
    </div>
  )
}

export const OnlineGame = () => {
  const { playerColor } = useContext(GameContext)
  const { ws } = useContext(WsContext)
  useEffect(() => {
    // set player as viewer
    ws
  }, [])
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
