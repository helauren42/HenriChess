import { useContext } from "react"
import { GameMovesHistory } from "../../componants/Play"
import { Game, GameAndPlayers } from "./Game"
import { Panel } from "./Panel"
import { GameResult } from "./Result"
import { GameContext } from "../../Contexts/Game"

export const OnlineGame = () => {
  const { winner } = useContext(GameContext)
  return (
    <div className="w-full flex items-center gap-2 justify-evenly">
      <GameAndPlayers />
      <Panel>
        <h3>OnlineGame Game</h3>
        <GameMovesHistory />
        {
          winner ?
            <GameResult winner={winner} />
            : null
        }
        {/* <LowerPanelHotseat /> */}
      </Panel>
    </div>
  )
}
