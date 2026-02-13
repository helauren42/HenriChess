import { useContext, useEffect } from "react"
import { PassiveBoard } from "./Board"
import { ChooseGame } from "./Panel"
import { WsContext } from "../../Contexts/Ws"

export const PlayPage = () => {
  const { ws } = useContext(WsContext)
  useEffect(() => {
    console.log("OMFGGGG !!!!")
    ws?.send(JSON.stringify({ "type": "joinActiveOnlineGame" }))
  }, [ws])
  return (
    <div className="w-full h-full flex items-center justify-evenly">
      <PassiveBoard />
      <div id="play-page" className="play-panel">
        <h3>Choose Mode</h3>
        <ChooseGame />
      </div>
    </div>
  )
}
