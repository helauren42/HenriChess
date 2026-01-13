import { useContext, useEffect } from "react"
import { GameContext } from "../../Contexts/Game"

// mention if no one there after 15secs
export const MatchmakeOnline = () => {
  const { startMatchmaking, endMatchmaking, ws } = useContext(GameContext)
  const sendStartMessage = async () => {
    const intervalId = setInterval(() => {
      if (ws && ws.readyState == ws.OPEN) {
        startMatchmaking()
        clearInterval(intervalId)
      }
    }, 500)
    return null
  }
  useEffect(() => {
    console.log("here")
    if (ws) {
      sendStartMessage()
    }
    return () => {
      if (ws && ws.readyState == ws.OPEN)
        endMatchmaking()
    }
  }, [ws?.readyState])
  return (
    <div>
    </div>
  )
}
