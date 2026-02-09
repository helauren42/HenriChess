import { useState, type ReactNode } from "react"
import { GameWatchContext, type GameWatchFace } from "../Contexts/ActiveOnlineGames"

export const GameWatchProvider = ({ children }: { children: ReactNode }) => {
  const [watchGames, setWatchGames] = useState<GameWatchFace[]>([])
  return (
    <GameWatchContext.Provider value={{ watchGames, setWatchGames }}>
      {children}
    </GameWatchContext.Provider>
  )
}
