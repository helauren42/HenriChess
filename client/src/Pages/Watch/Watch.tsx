import { useContext, useEffect } from "react"
import "./Watch.css"
import { GameContext } from "../../Contexts/Game"
import { WsContext } from "../../Contexts/Ws"

const MiniBoard = () => {
  return (<></>)
}

const MiniGameTitle = ({ blackUsername, whiteUsername }: { blackUsername: string, whiteUsername: string }) => {
  return (
    <div className="flex flex-col">
    </div>
  )
}

const MiniGame = ({ blackUsername, whiteUsername, fen }: { blackUsername: string, whiteUsername: string, fen: string }) => {
  return (
    <div className="mini-game">
    </div>
  )
}

export const WatchPage = () => {
  const { ws } = useContext(WsContext)
  useEffect(() => {
    ws?.send(JSON.stringify({ type: "getActiveGames" }))
    const id = setInterval(() => {
      console.log("WatchPage loop")
      ws?.send(JSON.stringify({ type: "getActiveGames" }))
    }, 5000)
    return () => clearInterval(id)
  }, [ws])
  return (
    <div>
      <h1>Watch</h1>
    </div>
  )
}
