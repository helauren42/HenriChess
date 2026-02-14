import { useContext } from "react"
import { GameAndPlayers } from "./Game"
import { Panel } from "./Panel"
import { GameContext } from "../../Contexts/Game"
import { BoardPanel } from "../../componants/Play"

const Buttons = () => {
  const { winner, restartGame, startGameHotseat, resignGame
  } = useContext(GameContext)
  return (
    <div id="lower-panel-hotseat" className="flex flex-col gap-3">
      {
        winner ?
          <button onClick={() => { startGameHotseat() }}>Replay</button>
          :
          <>
            <button onClick={() => resignGame()}>Resign</button>
            <button onClick={() => { restartGame() }} >Restart</button>
          </>
      }
    </div>
  )
}

export const HotseatGame = () => {
  return (
    <BoardPanel>
      <GameAndPlayers />
      <Panel title="Hotseat" game={true}>
        <Buttons />
      </Panel>
    </BoardPanel>
  )
}
