import { useContext, useEffect, useState } from "react"
import { WsContext } from "../Contexts/Ws"
import { OnlinePlayers } from "../componants/OnlinePlayers"
import { WatchPage } from "../componants/Watch/Watch"
import "./SocialPage.css"

export const SocialPage = () => {
  const { ws, lastMessage } = useContext(WsContext)
  const [onlinePlayers, setOnlinePlayers] = useState<[]>([])
  useEffect(() => {
    ws?.send(JSON.stringify({ "type": "onSocialPage" }))
    return () => ws?.send(JSON.stringify({ "type": "offSocialPage" }))
  }, [ws])
  useEffect(() => {
    if (lastMessage && lastMessage.type == "onlinePlayers") {
      setOnlinePlayers(lastMessage["players"])
    }
  }, [lastMessage])
  return (
    <div id="social-page" className="w-full h-full mt-10 flex flex-col justify-center items-center">
      <h1 className="text-center">Community Hub</h1>
      <div className="h-[8vh]"></div>
      <div id="social-content">
        <WatchPage />
        <OnlinePlayers onlinePlayers={onlinePlayers} />
      </div>
    </div>
  )
}
