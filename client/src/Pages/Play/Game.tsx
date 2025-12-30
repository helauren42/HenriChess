import { useContext } from "react"
import { GameContext } from "../../Contexts/Game.tsx"

import "./Game.css"
import { Board } from "./Board.tsx"

export const Game = () => {
  const { playerColor } = useContext(GameContext)
  return (
    <div id="play-board">
      {
        <Board playerColor={playerColor} />
      }
    </div>
  )
}
