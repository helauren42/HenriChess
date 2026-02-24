import { useContext, useEffect } from "react"
import { GameContext } from "../../Contexts/Game.tsx"

import "./Game.css"
import { Board } from "./Board.tsx"
import { useLocation } from "react-router-dom"
import { WsContext } from "../../Contexts/Ws.tsx"
import { addWaitCursor } from "../../utils/utils.tsx"

export const PlayerDisplay = ({ playerName }: { playerName: string }) => {
  return (
    <div className="ml-3">
      <h4>{playerName}</h4>
    </div>
  )
}

export const Game = () => {
  const { playerColor, getGameUpdate, setGameId, setMode, mode, gameId } = useContext(GameContext)
  const { ws } = useContext(WsContext)
  const location = useLocation()
  useEffect(() => {
    const currPath = location.pathname
    console.log("!!!!!!!!!!!!!!!! heree naved to game: ", currPath)
    const pathSplit = location.pathname.split("/")
    if (pathSplit.length < 4)
      return
    const newMode: "hotseat" | "online" | string = pathSplit[2] as "hotseat" | "online" | string
    if (newMode != "hotseat" && newMode != "online")
      return
    const tempId = parseInt(pathSplit[3])
    console.log("!!!!!!!!!!! tempId: ", tempId)
    addWaitCursor()
    if (newMode != mode)
      setMode(newMode)
    if (tempId != gameId)
      setGameId(tempId)
  }, [location, ws])
  useEffect(() => {
    getGameUpdate(gameId)
  }, [mode, gameId])
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
    <div className="game-players-wrapper">
      <div id="game-players">
        <PlayerDisplay playerName={topName} />
        <div id="play-board">
          <Game />
        </div>
        <PlayerDisplay playerName={botName} />
      </div>
    </div>
  )
}
