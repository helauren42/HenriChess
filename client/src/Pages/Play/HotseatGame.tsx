import { useContext } from "react"
import { GameMovesHistory } from "../../componants/Play"
import { GameAndPlayers } from "./Game"
import { Panel } from "./Panel"
import { GameContext } from "../../Contexts/Game"
import { FinishedSubpanel } from "./finishedSubpanel"

const Buttons = () => {
  const { winner, restartGame, startGameHotseat, resignGame
  } = useContext(GameContext)
  return (
    <div id="lower-panel-hotseat" className="flex flex-col gap-3">
      <button onClick={() => resignGame()}>Resign</button>
      <button onClick={() => {
        if (winner)
          startGameHotseat()
        else
          restartGame()
      }} >{winner ? "Replay" : "Restart"}</button>
    </div>
  )
}

export const HotseatGame = () => {
  const { winner } = useContext(GameContext)
  return (
    <div className="w-full flex items-center gap-2 justify-evenly">
      <GameAndPlayers />
      <Panel>
        <h3>Hotseat Game</h3>
        <GameMovesHistory />
        {
          winner ?
            <FinishedSubpanel />
            : null
        }
        <Buttons />
      </Panel>
    </div >
  )
}
