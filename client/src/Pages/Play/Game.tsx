import { useContext, useEffect } from "react"
import { GameContext } from "../../Contexts/Game.tsx"

import "./Game.css"
import { Board } from "./Board.tsx"
import { useLocation } from "react-router-dom"
import { WsContext } from "../../Contexts/Ws.tsx"

export const PlayerDisplay = ({ playerName }: { playerName: string }) => {
  return (
    <div className="ml-3">
      <h4>{playerName}</h4>
    </div>
  )
}

export const Game = () => {
  const { playerColor, getGameUpdate, setGameId, setMode } = useContext(GameContext)
  const { ws } = useContext(WsContext)
  const location = useLocation()
  useEffect(() => {
    const pathSplit = location.pathname.split("/")
    if (pathSplit.length < 4)
      return
    const mode: "hotseat" | "online" | string = pathSplit[2] as "hotseat" | "online" | string
    if (mode != "hotseat" && mode != "online")
      return
    const tempId = parseInt(pathSplit[3])
    setMode(mode)
    setGameId(tempId)
    getGameUpdate(tempId)
  }, [location, ws])
  useEffect(() => {
    console.log("player color is: ", playerColor)
  }, [playerColor])
  return (
    <Board playerColor={playerColor} />
  )
}

export const GameAndPlayers = () => {
  const { whiteUsername, blackUsername, playerColor } = useContext(GameContext)
  const topName = playerColor == "b" ? whiteUsername : blackUsername
  const botName = topName == whiteUsername ? blackUsername : whiteUsername
  return (
    <div id="game-players">
      <PlayerDisplay playerName={topName} />
      <div id="play-board">
        <Game />
      </div>
      <PlayerDisplay playerName={botName} />
    </div>
  )
}
