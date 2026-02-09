import { createContext, type Dispatch, type SetStateAction } from "react"

export interface GameWatchFace {
  id: number
  whiteUsername: string
  blackUsername: string
  whiteId: number
  blackId: number
  fen: string
}

export interface WatchPageFace {
  watchGames: GameWatchFace[]
  setWatchGames: Dispatch<SetStateAction<GameWatchFace[]>>
}

export const GameWatchContext = createContext<WatchPageFace>({
  watchGames: [],
  setWatchGames: () => ("used outside of context")
})
