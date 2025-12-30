import { memo, useContext } from "react"
import { GameContext } from "../Contexts/Game"

const GameMoveHistoryLine = memo(({ san, index }: { san: string, index: number }) => {
  return (
    <div id="game-moves-history-line" className="flex flex-row">
      <div id="move-number">{index + "."}</div>
      <div className="place-content-center">{san}</div>
    </div>
  )
})

export const GameMovesHistory = () => {
  const { gameMoves } = useContext(GameContext)
  return (
    // make it a grid with two sans per line
    <div id="game-moves-history" className="min-h-32 max-h-32">
      {
        gameMoves.map((val, index) => (
          <GameMoveHistoryLine key={`game-moves-history-line-${index}`} san={val.san} index={index} />
        ))
      }
    </div>

  )
}
