import { useContext, useEffect } from "react"
import { GameContext } from "../../Contexts/Game"

import "../../cssElem/loadingSpinner.css"
import { WsContext } from "../../Contexts/Ws"
import { useLocation, useNavigate } from "react-router-dom"
import { ToastCustomError } from "../../utils/toastify"

// mention if no one there after 15secs
export const MatchmakeOnline = () => {
  const { startMatchmaking, endMatchmaking } = useContext(GameContext)
  const { ws } = useContext(WsContext)
  const loc = useLocation()
  const nav = useNavigate()
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
    const changedPath = loc.pathname
    const matchMakePath = "/game/matchmake-online"
    console.log("changedPath: ", changedPath)
    const id = setTimeout(() => {
      // const path = window.location.pathname
      const path = loc.pathname
      if (path == matchMakePath) {
        ToastCustomError("No opponents found, you will be redirected")
        endMatchmaking()
        const redirId = setTimeout(() => {
          if (location.pathname == matchMakePath)
            nav("/game")
        }, 2500)
        return () => clearTimeout(redirId)
      }
    }, 3000)
    return () => clearInterval(id)
  }, [loc.pathname])
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
    <div className="w-full h-full mt-[12%] flex flex-col justify-center items-center text-center">
      <div className="w-full flex flex-col items-center gap-15">
        <h2>Searching for opponents</h2>
        <div className="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>
    </div>
  )
}
