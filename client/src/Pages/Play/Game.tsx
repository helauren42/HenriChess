import { useContext, useEffect } from "react"
import { GameContext } from "../../Contexts/Game.tsx"

import "./Game.css"
import { Board } from "./Board.tsx"
import { useLocation } from "react-router-dom"

export const Game = () => {
  const { playerColor, getGameUpdate } = useContext(GameContext)
  const location = useLocation()
  useEffect(() => {
    console.log("!!!!!!!!")
    console.log(location.pathname)
    const mode: "hotseat" | "online" = location.pathname.split("/")[2] as "hotseat" | "online"
    console.log(mode)
    getGameUpdate(mode)
  }, [location])
  return (
    <div id="play-board">
      {
        <Board playerColor={playerColor} />
      }
    </div>
  )
}
