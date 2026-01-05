import { useContext } from "react"
import { GameMovesHistory } from "../../componants/Play"
import { Game } from "./Game"
import { Panel } from "./Panel"
import { GameResult } from "./Result"
import { GameContext } from "../../Contexts/Game"

export const HotseatGame = () => {
  const { winner } = useContext(GameContext)
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
      </Panel>
    </div>
  )
}
