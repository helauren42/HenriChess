import { useContext, useEffect, useState } from "react"
import { GameContext } from "../../Contexts/Game.tsx"

import "./Game.css"
import { Board } from "./Board.tsx"
import { useLocation } from "react-router-dom"
import { WsContext } from "../../Contexts/Ws.tsx"
import { addWaitCursor } from "../../utils/utils.tsx"

export const PlayerDisplay = ({ playerName, winner, time }: { playerName: string, winner: number | null, time: number }) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.ceil(time % 60)
  return (
    <div className="ml-3 flex gap-5 items-center text-center">
      <h4>{playerName}</h4>
      {
        winner ? null :
          < p > {minutes}:{seconds}</p>
      }
    </div >
  )
}

export const Game = () => {
  const { playerColor, getGameUpdate, setGameId, setMode, mode, gameId } = useContext(GameContext)
  const { ws } = useContext(WsContext)
  const location = useLocation()
  useEffect(() => {
    const pathSplit = location.pathname.split("/")
    if (pathSplit.length < 4)
      return
    const newMode: "hotseat" | "online" | string = pathSplit[2] as "hotseat" | "online" | string
    if (newMode != "hotseat" && newMode != "online")
      return
    const tempId = parseInt(pathSplit[3])
    addWaitCursor()
    if (newMode != mode)
      setMode(newMode)
    if (tempId != gameId)
      setGameId(tempId)
    getGameUpdate(newMode, gameId)
  }, [location, ws])
  useEffect(() => {
    getGameUpdate(mode, gameId)
  }, [mode, gameId])
  useEffect(() => {
    console.log("player color is: ", playerColor)
  }, [playerColor])
  return (
    <Board playerColor={playerColor} />
  )
}

export const GameAndPlayers = () => {
  const { whiteUsername, blackUsername, playerColor, gameTs, winner } = useContext(GameContext)
  const topName = playerColor == "b" ? whiteUsername : blackUsername
  const botName = topName == whiteUsername ? blackUsername : whiteUsername
  const [whiteTime, setWhiteTime] = useState<number>(600)
  const [blackTime, setBlackTime] = useState<number>(600)
  useEffect(() => {
    if (gameTs != undefined && gameTs != null && gameTs.length > 0) {
      const lastTs = gameTs[gameTs.length - 1]
      setWhiteTime(600 - lastTs[0])
      setBlackTime(600 - lastTs[1])
    }
  }, [gameTs])
  useEffect(() => {
    console.log("!!!!!!!!!! GAME TS: ", gameTs)
  }, [gameTs])
  return (
    <div className="game-players-wrapper">
      <div id="game-players">
        <PlayerDisplay playerName={topName} winner={winner} time={topName == whiteUsername ? whiteTime : blackTime} />
        <div id="play-board">
          <Game />
        </div>
        <PlayerDisplay playerName={botName} winner={winner} time={botName == whiteUsername ? whiteTime : blackTime} />
      </div>
    </div>
  )
}
