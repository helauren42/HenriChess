import { createContext, type Dispatch, type SetStateAction } from "react"
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
  // moveFrom: string
  // moveTo: string
  // piece: string
  // capturedPiece: string | null
  // promotionTo: string | null
  uci: string
  san: string
}

export interface GameUpdateFace {
  id: number
  gameFens: string[]
  gameMoves: GameMoveFace[]
  winner: number | null
  winnerName: string | null
  whiteUsername: string
  blackUsername: string
  whiteId: number
  blackId: number
  // TODO add time
}

export interface GameFace {
  gameId: number | null
  setGameId: Dispatch<SetStateAction<number | null>>
  playerColor: "w" | "b" | "v"
  setPlayerColor: Dispatch<SetStateAction<"w" | "b" | "v">>
  playerTurn: "w" | "b"
  setPlayerTurn: Dispatch<SetStateAction<"w" | "b">>
  winner: null | number
  setWinner: Dispatch<SetStateAction<null | number>>
  winnerName: null | string
  setWinnerName: Dispatch<SetStateAction<null | string>>
  whiteUsername: string
  setWhiteUsername: Dispatch<SetStateAction<string>>
  blackUsername: string
  setBlackUsername: Dispatch<SetStateAction<string>>
  whiteId: number
  setWhiteId: Dispatch<SetStateAction<number>>
  blackId: number
  setBlackId: Dispatch<SetStateAction<number>>
  // board game
  mode: "hotseat" | "online"
  setMode: Dispatch<SetStateAction<"hotseat" | "online">>
  board: string
  setBoard: Dispatch<SetStateAction<string>>
  gameFens: string[]
  setGameFens: Dispatch<SetStateAction<string[]>>
  fenIndex: number
  setFenIndex: Dispatch<SetStateAction<number>>
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
  gameExpired: boolean
  setGameExpired: Dispatch<SetStateAction<boolean>>
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
  winner: null,
  setWinner: () => console.error("used outside of context"),
  winnerName: null,
  setWinnerName: () => console.error("used outside of context"),
  whiteUsername: "",
  setWhiteUsername: () => console.error("used outside of context"),
  blackUsername: "",
  setBlackUsername: () => console.error("used outside of context"),
  whiteId: 0,
  setWhiteId: () => console.error("used outside of context"),
  blackId: 0,
  setBlackId: () => console.error("used outside of context"),
  // board game
  mode: "hotseat",
  setMode: () => console.error("used outside of context"),
  board: INITIAL_BOARD,
  setBoard: () => console.error("used outside of context"),
  gameFens: [],
  setGameFens: () => console.error("used outside of context"),
  fenIndex: 0,
  setFenIndex: () => console.error("used outside of context"),
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
  gameExpired: false,
  setGameExpired() {
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

