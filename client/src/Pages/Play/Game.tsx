import { useContext, useEffect } from "react"
import { GameContext } from "../../Contexts/Game.tsx"

import "./Game.css"
import { Board } from "./Board.tsx"
import { useLocation } from "react-router-dom"

export const PlayerDisplay = ({ playerName }: { playerName: string }) => {
  return (
    <div className="h-[3%] ml-5">
      <h4>{playerName}</h4>
    </div>
  )
}

export const Game = () => {
  const { ws, playerColor, getGameUpdate, setGameId, setMode } = useContext(GameContext)
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
  const { whiteUsername, blackUsername, mode, playerTurn } = useContext(GameContext)
  const topName = mode == "online" || (mode == "hotseat" && playerTurn == "b") ? whiteUsername : blackUsername
  const botName = topName == whiteUsername ? blackUsername : whiteUsername
  return (
    <div className="flex flex-col">
      <PlayerDisplay playerName={topName} />
      <div id="play-board">
        <Game />
      </div>
      <PlayerDisplay playerName={botName} />
    </div>
  )
}
