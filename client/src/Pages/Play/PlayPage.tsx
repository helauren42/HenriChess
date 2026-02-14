import { useContext, useEffect } from "react"
import { PassiveBoard } from "./Board"
import { ChooseGame } from "./Panel"
import { WsContext } from "../../Contexts/Ws"
import { BoardPanel } from "../../componants/Play"

export const PlayPage = () => {
  const { ws } = useContext(WsContext)
  useEffect(() => {
    ws?.send(JSON.stringify({ "type": "joinActiveOnlineGame" }))
  }, [ws])
  return (
    <BoardPanel>
      <PassiveBoard />
      <div className="play-panel">
        <h3>Choose Mode</h3>
        <ChooseGame />
      </div>
    </BoardPanel>
  )
}
