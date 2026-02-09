import { useContext, useEffect } from "react"
import { GameContext } from "../../Contexts/Game"

import "../../cssElem/loadingSpinner.css"

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
    if (ws) {
      sendStartMessage()
    }
    return () => {
      if (ws && ws.readyState == ws.OPEN)
        endMatchmaking()
    }
  }, [ws?.readyState])
  return (
    <div className="w-full h-full -mt-[8%] flex flex-col justify-center items-center text-center">
      <div className="w-full flex flex-col items-center gap-15">
        <h2>Searching for opponents</h2>
        <div className="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>
    </div>
  )
}
