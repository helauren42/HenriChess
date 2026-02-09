import { useContext, useEffect, useState, type ReactNode } from "react"
import { WsContext } from "../Contexts/Ws";
import { SERVER_URL_WS } from "../utils/const";

export const WsProvider = ({ children }: { children: ReactNode }) => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<Record<string, any> | null>(null)
  const makeSocket = () => {
    const sock = new WebSocket(SERVER_URL_WS)
    const timeout = setTimeout(() => {
      if (sock.readyState != sock.OPEN)
        sock.close()
    }, 4000)

    sock.onopen = (e) => {
      clearTimeout(timeout)
      console.log("websocket on open: ", e)
      setWs(sock)
    }

    sock.onerror = (e) => {
      clearTimeout(timeout)
      console.error("websocket on error: ", e)
    }

    sock.onclose = (e) => {
      clearTimeout(timeout)
      console.log("websocket on close: ", e)
      ws?.close()
      setWs(null)
    };

    sock.onmessage = (event) => {
      const data: Record<string, any> = JSON.parse(event.data)
      console.log('Message type from server: ', data.type)
      console.log('Message from server: ', data)
      setLastMessage(data)
      switch (data.type) {
        case "game":
          break
        case "gameExpired":
          break
        case "gameMessage":
          break
        case "activeOnlineGames":
          break
      }
    }
  };
  useEffect(() => {
    console.log("ws has updated: ", ws)
    if (ws == null || ws?.readyState == ws?.CLOSED || ws?.readyState == ws.CLOSING) {
      const id = setTimeout(() => {
        makeSocket()
      }, 1000)
      return () => clearTimeout(id)
    }
  }, [ws])
  return (
    <WsContext.Provider value={{ ws, setWs, lastMessage, setLastMessage }}>
      {children}
    </WsContext.Provider>
  )
}
