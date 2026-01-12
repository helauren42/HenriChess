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
  winner: "w" | "b" | "d" | null
  id: number
}

export interface GameFace {
  gameId: number | null
  setGameId: Dispatch<SetStateAction<number | null>>
  playerColor: "w" | "b"
  setPlayerColor: Dispatch<SetStateAction<"w" | "b">>
  playerTurn: "w" | "b"
  setPlayerTurn: Dispatch<SetStateAction<"w" | "b">>
  winner: "w" | "b" | "d" | null
  setWinner: Dispatch<SetStateAction<"w" | "b" | "d" | null>>
  // board game
  mode: "hotseat" | "online"
  setMode: Dispatch<SetStateAction<"hotseat" | "online">>
  board: string
  setBoard: Dispatch<SetStateAction<string>>
  gameFens: string[]
  setGameFens: Dispatch<SetStateAction<string[]>>
  gameMoves: GameMoveFace[]
  setGameMoves: Dispatch<SetStateAction<GameMoveFace[]>>
  getGameUpdate: (tempId: number | null) => void
  // square selection
  selected: SelectedFace
  setSelected: Dispatch<SetStateAction<SelectedFace>>
  unselect: Dispatch<SetStateAction<SelectedFace>>
  squareClick: (id: string, piece: string) => void
  getFileNum: (file: string) => number
  // WS
  ws: RefObject<WebSocket | null>
  clientMove: (uciMove: string) => void
  restartGame: () => void
  startGame: () => void
  resignGame: () => void
  // Online Game
  startMatchmaking: () => void
}

export const GameContext = createContext<GameFace>({
  gameId: null,
  setGameId: () => console.error("used outside of context"),
  playerColor: "w",
  setPlayerColor: () => console.error("used outside of context"),
  playerTurn: "w",
  setPlayerTurn: () => console.error("used outside of context"),
  winner: null,
  setWinner: () => console.error("used outside of context"),
  // board game
  mode: "hotseat",
  setMode: () => console.error("used outside of context"),
  board: INITIAL_BOARD,
  setBoard: () => console.error("used outside of context"),
  gameFens: [],
  setGameFens: () => console.error("used outside of context"),
  gameMoves: [],
  setGameMoves: () => console.error("used outside of context"),
  getGameUpdate: (tempId: number | null) => console.error("used outside of context"),
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
  clientMove(uciMove: string) {
    console.error("used outside of context")
  },
  restartGame() {
    console.error("used outside of context")
  },
  startGame() {
    console.error("used outside of context")
  },
  resignGame() {
    console.error("used outside of context")
  },
  // Online Game
  startMatchmaking() {
    console.error("used outside of context")
  },
})

