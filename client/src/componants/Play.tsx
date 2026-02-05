import { memo, useContext, useEffect } from "react"
import { GameContext } from "../Contexts/Game"
import "./Play.css"

const GameMoveHistoryLine = memo(({ whiteUci, index, blackUci }: { whiteUci: string, index: number, blackUci: string | undefined }) => {
  const moveNumber = Math.floor(index / 2) + 1
  return (
    <div key={`move-pair-${index}`} className="flex w-full justify-between">
      <p className="w-8 text-left flex-1">{moveNumber}.</p>
      <p className="w-20 text-left flex-1">{whiteUci}</p>
      <p className="w-20 text-right flex-1">{blackUci ?? ""}</p>
    </div>
  )
})

export const GameMovesHistory = () => {
  const { gameMoves } = useContext(GameContext)

  useEffect(() => {
    console.log("change here")
    const elem = document.getElementById("game-moves-history")
    elem?.scrollBy({ top: elem.scrollHeight })
  }, [gameMoves])
  return (
    <div id="game-moves-history">
      {gameMoves.map((move, index) => {
        if (index % 2 === 0) {
          const whiteMove = move
          const blackMove = gameMoves[index + 1]
          return (
            <GameMoveHistoryLine key={"move-history-line" + index} whiteUci={whiteMove.uci} blackUci={blackMove != undefined ? blackMove.uci : undefined} index={index} />
          )
        }
        return null
      })}
    </div>
  )
}
