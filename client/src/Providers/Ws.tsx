import { useContext, useEffect, useState, type ReactNode } from "react"
import { WsContext } from "../Contexts/Ws";
import { SERVER_URL_WS } from "../utils/const";
import { UserContext } from "../Contexts/User";

export const WsProvider = ({ children }: { children: ReactNode }) => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<Record<string, any> | null>(null)
  const { user } = useContext(UserContext)
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
      setWs(null)
    }

    sock.onclose = (e) => {
      clearTimeout(timeout)
      console.log("websocket on close: ", e)
      setWs(null)
    };

    sock.onmessage = (event) => {
      const data: Record<string, any> = JSON.parse(event.data)
      console.log('Message type from server: ', data.type)
      console.log('Message from server: ', data)
      setLastMessage(data)
    }
  };
  useEffect(() => {
    if (user.username.length > 0 && (ws == null || ws?.readyState == ws?.CLOSED || ws?.readyState == ws.CLOSING)) {
      const id = setInterval(() => {
        makeSocket()
      }, 3500)
      return () => clearInterval(id)
    }
  }, [user, ws])
  return (
    <WsContext.Provider value={{ ws, setWs, lastMessage, setLastMessage }}>
      {children}
    </WsContext.Provider>
  )
}
