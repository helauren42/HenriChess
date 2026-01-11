import { useContext } from "react"
import { GameMovesHistory } from "../../componants/Play"
import { Game } from "./Game"
import { Panel } from "./Panel"
import { GameContext } from "../../Contexts/Game"
import { GameResult } from "./Result"

const LowerPanelHotseat = () => {
  const { winner, restartGame, startGame, resignGame } = useContext(GameContext)
  return (
    <div id="lower-panel-hotseat" className="flex flex-col gap-3">
      <button onClick={() => resignGame()}>Resign</button>
      <button onClick={() => {
        if (winner)
          startGame()
        else
          restartGame()
      }} >{winner ? "Replay" : "Restart"}</button>
    </div>
  )
}

export const HotseatGame = () => {
  const { winner, mode } = useContext(GameContext)
  return (
    <div className="w-full flex items-center gap-2 justify-evenly">
      <Game />
      <Panel>
        <h3>Hotseat Game</h3>
        <GameMovesHistory />
        {
          winner ?
            <GameResult winner={winner} />
            : null
        }
        <LowerPanelHotseat />
      </Panel>
    </div>
  )
}
