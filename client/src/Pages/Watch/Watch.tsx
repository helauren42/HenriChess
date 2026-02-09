import { useContext, useEffect } from "react"
import "./Watch.css"
import { GameContext } from "../../Contexts/Game"

export const WatchPage = () => {
  const { ws } = useContext(GameContext)
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
      <h1>Watch Motherfuckeeeeeer !!!</h1>
    </div>
  )
}
