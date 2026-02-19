import { useContext, useEffect, useState } from "react"
import { GameAndPlayers } from "./Game"
import { Panel } from "./Panel"
import { GameContext } from "../../Contexts/Game"
import { useNavigate } from "react-router-dom"
import { WsContext } from "../../Contexts/Ws"
import { BoardPanel } from "../../componants/Play"
import { UserContext } from "../../Contexts/User"
import "./OnlineGame.css"

const Buttons = () => {
  const { resignGame, winner } = useContext(GameContext)
  const nav = useNavigate()
  return (
    <div id="lower-panel" className="flex flex-col gap-3">
      {
        winner == null ?
          <>
            <button onClick={() => resignGame()}>Resign</button>
          </> :
          <>
            <button onClick={() => nav("/game/matchmake-online")}>Play Again</button>
          </>
      }
    </div>
  )
}

const MessageBlock = ({ username, message, index }: { username: string, message: string, index: number }) => {
  return (
    <div key={`message-block-${index}`} className="message-block">
      <p>{username}: {message}</p>
    </div>
  )
}

const Messages = () => {
  const { messages } = useContext(GameContext)
  return (
    <div id="messages" className="h-full">
      {
        messages.map((message, index) => {
          return <MessageBlock username={message.username} message={message.message} index={index} />
        })
      }
    </div>
  )

}

const OnlineChat = () => {
  const { gameId } = useContext(GameContext)
  const { user } = useContext(UserContext)
  const { ws } = useContext(WsContext)
  const sendMessage = (message: string) => {
    console.log("!!!!!!!!!!!!!!! sendMessage")
    ws?.send(JSON.stringify({ "type": "gameMessage", gameId, "username": user.username, "message": message }))
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const message = e.currentTarget.value
    if (e.key == "Enter" && message.length > 0) {
      sendMessage(message)
      e.currentTarget.value = ""
      return
    }
  }
  return (
    <div id="online-messages" className="bg-(--bg-color-light) flex flex-col h-full rounded-xl p-3">
      <Messages />
      <input id="message-input" onKeyDown={(e) => handleKeyDown(e)} className="bg-red-700" />
    </div>
  )
}

export const OnlineGame = () => {
  const { playerColor, winner } = useContext(GameContext)
  const { ws } = useContext(WsContext)
  useEffect(() => {
    // set player as viewer
    if (playerColor != "v")
      return
    const splitted = location.pathname.split("/")
    const gameId = splitted[splitted.length - 1]
    ws?.send(JSON.stringify({ type: "addViewer", gameId: gameId }))
    return () => ws?.send(JSON.stringify({ type: "removeViewer", gameId: gameId }))
  }, [playerColor, ws])
  return (
    <BoardPanel>
      <GameAndPlayers />
      <Panel title="Online" game={true}>
        {
          playerColor != "v" && !winner ?
            <>
              <OnlineChat />
              <Buttons />
            </>
            : null
        }
      </Panel>
    </BoardPanel>
  )
}
