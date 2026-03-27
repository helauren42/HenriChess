import { useContext, useEffect } from "react"
import { GameContext } from "../../Contexts/Game.tsx"

import "./Game.css"
import { Board } from "./Board.tsx"
import { useLocation } from "react-router-dom"
import { WsContext } from "../../Contexts/Ws.tsx"
import { addWaitCursor } from "../../utils/utils.tsx"

export const TimeDisplay = ({ time }: { time: number }) => {
  let minutes = Math.floor(time / 60)
  let seconds = Math.floor(time % 60)
  const peanutsLeft = time - (minutes * 60 + seconds)
  let deciseconds = Math.ceil(peanutsLeft * 10)
  if (seconds == 60) {
    minutes += 1
    deciseconds = 0
  }
  if (deciseconds == 10) {
    seconds += 1
    deciseconds = 0
  }
  return (
    <p>{minutes}:{seconds >= 10 ? seconds : "0" + seconds}:{deciseconds}</p>
  )
}

export const PlayerDisplay = ({ mode, playerName, winner, time }: { mode: "hotseat" | "online", playerName: string, winner: number | null, time: number }) => {
  return (
    <div className="ml-3 flex gap-5 items-center text-center">
      <h4>{playerName}</h4>
      {
        mode == "hotseat" || winner ? null :
          <TimeDisplay time={time} />
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
    getGameUpdate(newMode, tempId)
  }, [location, ws])
  useEffect(() => {
    console.log("player color is: ", playerColor)
  }, [playerColor])
  return (
    <Board playerColor={playerColor} />
  )
}

export const GameAndPlayers = () => {
  const { whiteUsername, blackUsername, playerColor, whiteTime, blackTime, winner, mode } = useContext(GameContext)
  const topName = playerColor == "b" ? whiteUsername : blackUsername
  const botName = topName == whiteUsername ? blackUsername : whiteUsername
  return (
    <div className="game-players-wrapper">
      <div id="game-players">
        <PlayerDisplay mode={mode} playerName={topName} winner={winner} time={topName == whiteUsername ? whiteTime : blackTime} />
        <div id="play-board">
          <Game />
        </div>
        <PlayerDisplay mode={mode} playerName={botName} winner={winner} time={botName == whiteUsername ? whiteTime : blackTime} />
      </div>
    </div>
  )
}
