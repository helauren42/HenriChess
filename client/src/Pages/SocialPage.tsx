import { useContext, useEffect } from "react"
import { WsContext } from "../Contexts/Ws"

export const SocialPage = () => {
  const { ws } = useContext(WsContext)
  useEffect(() => {
    ws?.send(JSON.stringify({ "type": "trackPlayers" }))
    return () => ws?.send(JSON.stringify({ "type": "untrackPlayers" }))
  }, [ws])
  return (
    <div id="social-page" className="flex flex-col">
    </div>
  )
}
