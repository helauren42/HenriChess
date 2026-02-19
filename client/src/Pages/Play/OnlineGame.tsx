import { useContext, useEffect } from "react"
import { GameAndPlayers } from "./Game"
import { Panel } from "./Panel"
import { GameContext } from "../../Contexts/Game"
import { useNavigate } from "react-router-dom"
import { WsContext } from "../../Contexts/Ws"
import { BoardPanel } from "../../componants/Play"

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

const Messages = () => {
  const { messages } = useContext(GameContext)
  return (
    <div id="online-messages" className="bg-(--bg-color-light) h-full rounded-sm">
    </div>
  )
}

export const OnlineGame = () => {
  const { playerColor, winner } = useContext(GameContext)
  const { ws } = useContext(WsContext)
  useEffect(() => {
    // set player as viewer
    if (playerColor != "v")
      return
    const splitted = location.pathname.split("/")
    const gameId = splitted[splitted.length - 1]
    ws?.send(JSON.stringify({ type: "addViewer", gameId: gameId }))
    return () => ws?.send(JSON.stringify({ type: "removeViewer", gameId: gameId }))
  }, [playerColor, ws])
  return (
    <BoardPanel>
      <GameAndPlayers />
      <Panel title="Online" game={true}>
        {
          playerColor != "v" && !winner ?
            <>
              <Messages />
              <Buttons />
            </>
            : null
        }
      </Panel>
    </BoardPanel>
  )
}
