import { memo, useContext, useEffect, type ReactNode } from "react"
import { GameContext } from "../Contexts/Game"
import "./Play.css"
import { SvgLastPosition, SvgNextPosition, SvgFirstPosition, SvgPreviousPosition } from "../svgs/svgs"
import { AuthCompContext } from "../Contexts/AuthComp"
import { UserContext } from "../Contexts/User"

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

export const ViewMoves = () => {
  const { fenIndex, setFenIndex, gameFens } = useContext(GameContext)
  const makeUnclickable = (elementId: string) => {
    document.getElementById(elementId)?.classList.remove("fill-(--text-color-dark)")
    document.getElementById(elementId)?.classList.remove("cursor-pointer")
    document.getElementById(elementId)?.classList.add("fill-(--disabled)")
  }
  const makeClickable = (elementId: string) => {
    document.getElementById(elementId)?.classList.remove("fill-(--disabled)")
    document.getElementById(elementId)?.classList.add("fill-(--text-color-dark)")
    document.getElementById(elementId)?.classList.add("cursor-pointer")
  }
  useEffect(() => {
    makeClickable("first-position")
    makeClickable("previous-position")
    makeClickable("next-position")
    makeClickable("last-position")
    if (fenIndex == 0) {
      makeUnclickable("first-position")
      makeUnclickable("previous-position")
    }
    if (fenIndex == gameFens.length - 1) {
      makeUnclickable("next-position")
      makeUnclickable("last-position")
    }
  }, [fenIndex, gameFens])
  return (
    <div id="view-moves" className="flex flex-row h-8 justify-between">
      <SvgFirstPosition onClick={() => setFenIndex(0)} />
      <SvgPreviousPosition onClick={() => setFenIndex((prev) => Math.max(prev - 1, 0))} />
      <SvgNextPosition onClick={() => setFenIndex((prev) => Math.min(prev + 1, gameFens.length - 1))} />
      <SvgLastPosition onClick={() => setFenIndex(gameFens.length - 1)} />
    </div>
  )
}

export const BoardPanel = ({ children }: { children: ReactNode }) => {
  const { openAuth, closeAuth } = useContext(AuthCompContext)
  const { user } = useContext(UserContext)
  useEffect(() => {
    if (user.username.length > 0)
      closeAuth()
    else
      openAuth("unauthorized")
  }, [user])
  return (
    <div id="board-panel" >
      {children}
    </div>
  )
}

