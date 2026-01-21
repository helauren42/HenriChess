import { memo, useContext, useEffect } from "react"
import { GameContext } from "../Contexts/Game"
import "./Play.css"

const GameMoveHistoryLine = memo(({ whiteSan, index, blackSan }: { whiteSan: string, index: number, blackSan: string | undefined }) => {
  const moveNumber = Math.floor(index / 2) + 1
  return (
    <div key={`move-pair-${index}`} className="flex w-full justify-between">
      <p className="w-8 text-left flex-1">{moveNumber}.</p>
      <p className="w-20 text-left flex-1">{whiteSan}</p>
      <p className="w-20 text-right flex-1">{blackSan ?? ""}</p>
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
            <GameMoveHistoryLine key={"move-history-line" + index} whiteSan={whiteMove.san} blackSan={blackMove != undefined ? blackMove.san : undefined} index={index} />
          )
        }
        return null
      })}
    </div>
  )
}
