import { createContext, type Dispatch, type SetStateAction } from "react"

export interface OnlinePlayer {
  name: string
  inGame: boolean
  // idle: boolean # TODO
}

export interface OnlinePlayersFace {
  onlinePlayers: OnlinePlayer[]
  setOnlinePlayers: Dispatch<SetStateAction<OnlinePlayer[]>>
}

export const OnlinePlayersContext = createContext<OnlinePlayersFace>({
  onlinePlayers: [],
  setOnlinePlayers: () => {
    console.error("onlinePlayers used outside of context")
  }
})
