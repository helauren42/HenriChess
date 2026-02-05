import { useContext, useEffect, useState } from "react"
import { GameContext } from "../../Contexts/Game"

export const GameResult = ({ winner }: { winner: number }) => {
  const { whiteUsername, blackUsername, whiteId, blackId } = useContext(GameContext)
  const winnerString = () => {
    console.log("FUNCTION: ", whiteUsername, ", ", blackUsername)
    console.log(winner)
    console.log(whiteId)
    console.log(blackId)
    if (winner == whiteId)
      return whiteUsername
    if (winner == blackId)
      return blackUsername
  }
  return (
    <div>
      {
        winner ?
          <h3>Winner is {winnerString()}</h3>
          :
          <h3>Game resulted in a Draw</h3>
      }
    </div>
  )
}
