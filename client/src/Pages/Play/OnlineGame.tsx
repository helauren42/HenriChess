import { useContext, useEffect, useState } from "react"
import { GameAndPlayers } from "./Game"
import { Panel } from "./Panel"
import { GameContext } from "../../Contexts/Game"
import { useNavigate } from "react-router-dom"
import { WsContext } from "../../Contexts/Ws"
import { BoardPanel } from "../../componants/Play"
import { UserContext } from "../../Contexts/User"
import "./OnlineGame.css"
import { trimUsername } from "../../utils/utils"

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

const MessageBlock = ({ username, playerName, message }: { username: string, playerName: string, message: string }) => {
  const me = username == playerName
  return (
    <div className="message-block w-full text-left font-light text-black">
      {
        me ?
          <div id="player-message" className="w-ful">
            <p className="break-all w-fit max-w-[80%] p-2 mb-1 rounded-xl flex justify-start bg-[rgb(200,180,170)] ">{message}</p>
          </div>
          :
          <div id="player-message" className="w-full p-2 flex flex-end justify-end">
            <p className="break-all text-black w-fit max-w-[80%] p-2 mb-1 rounded-xl bg-[rgb(210,170,160)] ">{message}</p>
          </div>
      }
    </div>
  )
}

const Messages = () => {
  const { messages } = useContext(GameContext)
  const { user } = useContext(UserContext)
  return (
    <div id="messages" className="h-full overflow-scroll pb-5 pl-3 pr-3">
      {
        messages.map((message, index) => {
          return <MessageBlock key={`message-block-${index}`} username={trimUsername(user.username)} playerName={trimUsername(message.username)} message={message.message} />
        })
      }
    </div>
  )

}

const OnlineChat = () => {
  const { gameId } = useContext(GameContext)
  const { ws } = useContext(WsContext)
  const sendMessage = (message: string) => {
    ws?.send(JSON.stringify({ "type": "gameMessage", gameId, "message": message }))
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
