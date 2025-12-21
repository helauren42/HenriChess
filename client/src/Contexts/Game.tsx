import { createContext, type Dispatch, type SetStateAction } from "react"
import { baseBoardWhite } from "../utils/Game"

export interface SelectedFace {
  id: string
  rank: number
  file: string
}

export interface Pos {
  rank: number
  file: string
}

export interface GameFace {
  state: "active" | "finished" | "inactive"
  board: Int8Array
  setBoard: Dispatch<SetStateAction<Int8Array>>
  newBoard: () => void
  playerColor: "w" | "b"
  setPlayerColor
  : Dispatch<SetStateAction<"w" | "b">>
  selected: SelectedFace
  setSelected: Dispatch<SetStateAction<SelectedFace>>
  unselect: Dispatch<SetStateAction<SelectedFace>>
  squareClick: (id: string, makeMove: (source: Pos, dest: Pos) => Promise<void>) => void
  getFileNum: (file: string) => number
  getSquare: (rank: number, file: string) => number
}

export const GameContext = createContext<GameFace>({
  state: "inactive",
  board: new Int8Array(baseBoardWhite),
  setBoard: () => console.log("used outside of context"),
  newBoard: () => console.log("used outside of context"),
  playerColor: "w",
  setPlayerColor: () => console.log("used outside of context"),
  selected: { id: "", rank: 0, file: "" },
  setSelected: () => console.log("used outside of context"),
  unselect: () => console.log("used outside of context"),
  squareClick: (id: string, makeMove: (source: Pos, dest: Pos) => Promise<void>) => console.log("used outside of context"),
  getFileNum: (file: string) => {
    console.log("used outside of context")
    return 0
  },
  getSquare: (rank: number, file: string) => {
    console.log("used outside of context")
    return 0
  }
})

