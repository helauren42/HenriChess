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

export interface GameMoveFace {
  moveFrom: string
  moveTo: string
  piece: string
  capturedPiece: string | null
  promotionTo: string | null
  san: string
}

export interface GameUpdateFace {
  gameFens: string[]
  gameMoves: GameMoveFace[]
}

export interface GameFace {
  gameId: string | null
  setGameId: Dispatch<SetStateAction<string | null>>
  playerColor: "w" | "b"
  setPlayerColor: Dispatch<SetStateAction<"w" | "b">>
  // board game
  board: string
  setBoard: Dispatch<SetStateAction<string>>
  gameFens: string[]
  setGameFens: Dispatch<SetStateAction<string[]>>
  gameMoves: GameMoveFace[]
  setGameMoves: Dispatch<SetStateAction<GameMoveFace[]>>
  // square selection
  selected: SelectedFace
  setSelected: Dispatch<SetStateAction<SelectedFace>>
  unselect: Dispatch<SetStateAction<SelectedFace>>
  squareClick: (id: string, piece: string) => void
  getFileNum: (file: string) => number
  // WS
  ws: RefObject<WebSocket | null>
  clientMove: (src: Pos, dest: Pos) => void
  startGame: (type: "hotseat" | "online") => void
}

export const GameContext = createContext<GameFace>({
  gameId: null,
  setGameId: () => console.error("used outside of context"), playerColor: "w",
  setPlayerColor: () => console.error("used outside of context"),
  // board game
  board: INITIAL_BOARD,
  setBoard: () => console.error("used outside of context"),
  gameFens: [],
  setGameFens: () => console.error("used outside of context"),
  gameMoves: [],
  setGameMoves: () => console.error("used outside of context"),
  // square selection
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
  clientMove(src: Pos, dest: Pos) {
    console.error("used outside of context")
  },
  startGame(type: "hotseat" | "online") {
    console.error("used outside of context")
  },
})

