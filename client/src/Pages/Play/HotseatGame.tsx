import { GameMovesHistory } from "../../componants/Play"
import { Game } from "./Game"
import { Panel } from "./Panel"

export const HotseatGame = () => {
  return (
    <div className="w-full flex items-center gap-2 justify-evenly">
      <Game />
      <Panel>
        <h3>Hotseat Game</h3>
        <GameMovesHistory />
      </Panel>
    </div>
  )
}
