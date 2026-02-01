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
  id: number
  gameFens: string[]
  gameMoves: GameMoveFace[]
  winner: "w" | "b" | "d" | ""
  whiteUsername: string
  blackUsername: string
  // TODO add time
}

export interface GameFace {
  gameId: number | null
  setGameId: Dispatch<SetStateAction<number | null>>
  playerColor: "w" | "b" | "v"
  setPlayerColor: Dispatch<SetStateAction<"w" | "b" | "v">>
  playerTurn: "w" | "b"
  setPlayerTurn: Dispatch<SetStateAction<"w" | "b">>
  winner: "w" | "b" | "d" | ""
  setWinner: Dispatch<SetStateAction<"w" | "b" | "d" | "">>
  whiteUsername: string
  setWhiteUsername: Dispatch<SetStateAction<string>>
  blackUsername: string
  setBlackUsername: Dispatch<SetStateAction<string>>
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
  ws: WebSocket | null
  setWs: Dispatch<SetStateAction<WebSocket | null>>
  clientMove: (uciMove: string) => void
  restartGame: () => void
  startGameHotseat: () => void
  resignGame: () => void
  // Online Game
  startMatchmaking: () => void
  endMatchmaking: () => void
}

export const GameContext = createContext<GameFace>({
  gameId: null,
  setGameId: () => console.error("used outside of context"),
  playerColor: "w",
  setPlayerColor: () => console.error("used outside of context"),
  playerTurn: "w",
  setPlayerTurn: () => console.error("used outside of context"),
  winner: "",
  setWinner: () => console.error("used outside of context"),
  whiteUsername: "",
  setWhiteUsername: () => console.error("used outside of context"),
  blackUsername: "",
  setBlackUsername: () => console.error("used outside of context"),
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
  ws: null,
  setWs: () => console.error("used outside of context"),
  clientMove(uciMove: string) {
    console.error("used outside of context")
  },
  restartGame() {
    console.error("used outside of context")
  },
  startGameHotseat() {
    console.error("used outside of context")
  },
  resignGame() {
    console.error("used outside of context")
  },
  // Online Game
  startMatchmaking() {
    console.error("used outside of context")
  },
  endMatchmaking() {
    console.error("used outside of context")
  },
})

