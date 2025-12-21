import { useContext } from "react"
import { GameContext } from "../../Contexts/Game.tsx"

import "./Game.css"
import { Board } from "./Board.tsx"

export const Game = () => {
  const { state, playerColor, board, newBoard } = useContext(GameContext)
  return (
    <div id="play-board">
      {
        <Board board={board} playerColor={playerColor} />
      }
    </div>
  )
}
