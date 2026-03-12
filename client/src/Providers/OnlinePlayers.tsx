import { OnlinePlayersContext, type OnlinePlayer } from "../Contexts/OnlinePlayers";
import { useState, type ReactNode } from "react"

export const OnlinePlayersProvider = ({ children }: { children: ReactNode }) => {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([])
  return (
    <OnlinePlayersContext.Provider value={{ onlinePlayers, setOnlinePlayers }}> {children}
    </OnlinePlayersContext.Provider>
  )
}
