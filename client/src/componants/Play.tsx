import { memo, useContext, useEffect } from "react"
import { GameContext } from "../Contexts/Game"
import "./Play.css"

const GameMoveHistoryLine = memo(({ whiteSan, index, blackSan }: { whiteSan: string, index: number, blackSan: string | undefined }) => {
  const moveNumber = Math.floor(index / 2) + 1
  return (
    <div key={`move-pair-${index}`} className="flex items-center gap-8">
      <span className="w-8 text-right">{moveNumber}.</span>

      <div className="flex justify-evenly w-full -ml-5">
        <span className="w-20">{whiteSan}</span>
        <span className="w-20">{blackSan ?? ""}</span>
      </div>
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
          const blackMove = gameMoves[index + 1] // is undefined if last move was white
          return (
            <GameMoveHistoryLine key={"move-history-line" + index} whiteSan={whiteMove.san} blackSan={blackMove != undefined ? blackMove.san : undefined} index={index} />
          )
        }
        return null
      })}
    </div>
  )
}
