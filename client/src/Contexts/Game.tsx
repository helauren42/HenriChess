import { createContext, type Dispatch, type SetStateAction } from "react"
import { baseBoardWhite } from "../utils/Game"

export interface GameFace {
  state: "active" | "finished" | "inactive"
  board: Int8Array
  setBoard: Dispatch<SetStateAction<Int8Array>>
  newBoard: () => void
  color: "white" | "black"
  setColor: Dispatch<SetStateAction<"white" | "black">>
}

export const GameContext = createContext<GameFace>({
  state: "inactive",
  board: new Int8Array(baseBoardWhite),
  setBoard: () => console.log("used outside of context"),
  newBoard: () => console.log("used outside of context"),
  color: "white",
  setColor: () => console.log("used outside of context"),
})

