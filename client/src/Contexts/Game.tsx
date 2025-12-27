import { createContext, type Dispatch, type RefObject, type SetStateAction } from "react"
import { baseBoardWhite } from "../utils/Game"
import { SERVER_URL_WS } from "../utils/const"

export const WsContext = createContext({
})

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
  gameId: string | null
  setGameId: Dispatch<SetStateAction<string | null>>
  board: Int8Array
  setBoard: Dispatch<SetStateAction<Int8Array>>
  newBoard: () => void
  playerColor: "w" | "b"
  setPlayerColor: Dispatch<SetStateAction<"w" | "b">>
  selected: SelectedFace
  setSelected: Dispatch<SetStateAction<SelectedFace>>
  unselect: Dispatch<SetStateAction<SelectedFace>>
  squareClick: (id: string) => void
  getFileNum: (file: string) => number
  getSquare: (rank: number, file: string) => number
  // WS
  ws: RefObject<WebSocket | null>
  gameMove: (src: Pos, dest: Pos) => void
}

export const GameContext = createContext<GameFace>({
  gameId: null,
  setGameId: () => console.error("used outside of context"),
  board: new Int8Array(baseBoardWhite),
  setBoard: () => console.error("used outside of context"),
  newBoard: () => console.error("used outside of context"),
  playerColor: "w",
  setPlayerColor: () => console.error("used outside of context"),
  selected: { id: "", rank: 0, file: "" },
  setSelected: () => console.error("used outside of context"),
  unselect: () => console.error("used outside of context"),
  squareClick: (id: string) => console.error("used outside of context"),
  getFileNum: (file: string) => {
    console.error("used outside of context")
    return 0
  },
  getSquare: (rank: number, file: string) => {
    console.error("used outside of context")
    return 0
  },
  ws: { current: null },
  gameMove(src: Pos, dest: Pos) {
    console.error("used outside of context")
  },
})

