import { createContext, type Dispatch, type SetStateAction } from "react"

export interface WsFace {
  lastMessage: Record<string, any> | null
  setLastMessage: Dispatch<SetStateAction<Record<string, any> | null>>
  ws: WebSocket | null
  setWs: Dispatch<SetStateAction<WebSocket | null>>
}

export const WsContext = createContext<WsFace>({
  lastMessage: null,
  setLastMessage: () => console.error("used outside of context"),
  ws: null,
  setWs: () => console.error("used outside of context"),
})
