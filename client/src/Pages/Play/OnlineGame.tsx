import { useContext } from "react"
import { GameMovesHistory } from "../../componants/Play"
import { GameAndPlayers } from "./Game"
import { Panel } from "./Panel"
import { GameResult } from "./Result"
import { GameContext } from "../../Contexts/Game"

const Buttons = () => {
  const { resignGame, winner } = useContext(GameContext)
  return (
    <div id="lower-panel" className="flex flex-col gap-3">
      {
        winner == null ?
          <>
            <button onClick={() => resignGame()}>Resign</button>
          </> :
          <>
          </>
      }
    </div>
  )
}

export const OnlineGame = () => {
  const { winner } = useContext(GameContext)
  return (
    <div className="w-full flex items-center gap-2 justify-evenly">
      <GameAndPlayers />
      <Panel>
        <h3>Online Game</h3>
        <GameMovesHistory />
        {
          winner ?
            <GameResult winner={winner} />
            : null
        }
        <Buttons />
      </Panel>
    </div>
  )
}
