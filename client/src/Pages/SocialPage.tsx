import { useContext, useEffect, useState } from "react"
import { WsContext } from "../Contexts/Ws"
import { NoOnlinePlayers, OnlinePlayers } from "../componants/OnlinePlayers"

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
      {
        onlinePlayers.length <= 1 ?
          <NoOnlinePlayers />
          : <OnlinePlayers onlinePlayers={onlinePlayers} />
      }
    </div>
  )
}
