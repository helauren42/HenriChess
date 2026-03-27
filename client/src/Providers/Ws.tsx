import { useContext, useEffect, useState, type ReactNode } from "react"
import { WsContext } from "../Contexts/Ws";
import { SERVER_URL_WS } from "../utils/const";
import { UserContext } from "../Contexts/User";

export const WsProvider = ({ children }: { children: ReactNode }) => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<Record<string, any> | null>(null)
  const [timeMessage, setTimeMessage] = useState<Record<string, any> | null>(null)
  const [connecting, setConnecting] = useState<boolean>(false)
  const { user } = useContext(UserContext)
  const makeSocket = () => {
    setConnecting(true)
    const sock = new WebSocket(SERVER_URL_WS)
    const timeout = setTimeout(() => {
      if (sock.readyState != sock.OPEN) {
        sock.close()
        setConnecting(false)
      }
    }, 10000)

    sock.onopen = (e) => {
      clearTimeout(timeout)
      console.log("websocket on open: ", e)
      setWs(sock)
      setConnecting(false)
    }

    sock.onerror = (e) => {
      clearTimeout(timeout)
      console.error("websocket on error: ", e)
      setWs(null)
      setConnecting(false)
    }

    sock.onclose = (e) => {
      clearTimeout(timeout)
      console.log("websocket on close: ", e)
      setWs(null)
      setConnecting(false)
    };

    sock.onmessage = (event) => {
      const data: Record<string, any> = JSON.parse(event.data)
      if (data.type != "gameTs") {
        console.log('Message type from server: ', data.type)
        console.log('Message from server: ', data)
        setLastMessage(data)
      }
      else {
        setTimeMessage(data)
      }
    }
  };
  useEffect(() => {
    if ((ws == null || ws?.readyState == ws?.CLOSED || ws?.readyState == ws.CLOSING)
      && connecting == false) {
      makeSocket()
    }
  }, [user, ws])
  return (
    <WsContext.Provider value={{ ws, setWs, lastMessage, setLastMessage, timeMessage, setTimeMessage }}>
      {children}
    </WsContext.Provider>
  )
}
