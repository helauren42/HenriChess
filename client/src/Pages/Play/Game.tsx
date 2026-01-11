import { useContext, useEffect } from "react"
import { GameContext } from "../../Contexts/Game.tsx"

import "./Game.css"
import { Board } from "./Board.tsx"
import { useLocation } from "react-router-dom"

export const Game = () => {
  const { playerColor, getGameUpdate, setGameId } = useContext(GameContext)
  const location = useLocation()
  useEffect(() => {
    console.log(location.pathname)
    const pathSplit = location.pathname.split("/")
    console.log(pathSplit.length)
    if (pathSplit.length < 4)
      return
    const mode: "hotseat" | "online" | string = pathSplit[2] as "hotseat" | "online" | string
    if (mode != "hotseat" && mode != "online")
      return
    const tempId = parseInt(pathSplit[3])
    setGameId(tempId)
    console.log(mode)
    console.log("TEMP: ", parseInt(pathSplit[3]))
    getGameUpdate(tempId)
  }, [location])
  return (
    <div id="play-board">
      {
        <Board playerColor={playerColor} />
      }
    </div>
  )
}
