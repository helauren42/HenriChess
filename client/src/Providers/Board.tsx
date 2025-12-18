import { useEffect, useState, type ReactNode } from "react";
import { GameContext } from "../Contexts/Game.tsx";
import { baseBoardBlack, baseBoardWhite } from "../utils/Game";

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const state = "inactive"
  const [board, setBoard] = useState<Int8Array>(baseBoardWhite)
  const [color, setColor] = useState<"white" | "black">("white")
  const newBoard = () => {
    setColor(Math.random() >= 0.5 ? "white" : "black")
  }
  useEffect(() => {
    setBoard(color == "white" ? baseBoardWhite : baseBoardBlack)
  }, [color])
  return (
    <GameContext.Provider value={{ state, board, setBoard, newBoard, color, setColor }} >
      {children}
    </GameContext.Provider>
  )
}
