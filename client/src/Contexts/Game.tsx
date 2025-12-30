import { createContext, type Dispatch, type RefObject, type SetStateAction } from "react"
import { INITIAL_BOARD } from "../utils/const"

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
  playerColor: "w" | "b"
  setPlayerColor: Dispatch<SetStateAction<"w" | "b">>
  board: string
  setBoard: Dispatch<SetStateAction<string>>
  // square selection
  selected: SelectedFace
  setSelected: Dispatch<SetStateAction<SelectedFace>>
  unselect: Dispatch<SetStateAction<SelectedFace>>
  squareClick: (id: string, piece: string) => void
  getFileNum: (file: string) => number
  // WS
  ws: RefObject<WebSocket | null>
  gameMove: (src: Pos, dest: Pos) => void
  startGame: (type: "hotseat" | "online") => void
}

export const GameContext = createContext<GameFace>({
  gameId: null,
  setGameId: () => console.error("used outside of context"),
  playerColor: "w",
  setPlayerColor: () => console.error("used outside of context"),
  board: INITIAL_BOARD,
  setBoard: () => console.error("used outside of context"),
  // square selction
  selected: { id: "", rank: 0, file: "" },
  setSelected: () => console.error("used outside of context"),
  unselect: () => console.error("used outside of context"),
  squareClick: (id: string, piece: string) => console.error("used outside of context"),
  getFileNum: (file: string) => {
    console.error("used outside of context")
    return 0
  },
  // WS
  ws: { current: null },
  gameMove(src: Pos, dest: Pos) {
    console.error("used outside of context")
  },
  startGame(type: "hotseat" | "online") {
    console.error("used outside of context")
  },
})

