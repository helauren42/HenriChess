import { useContext } from "react"
import { GameContext } from "../../Contexts/Game"

export const GameResult = ({ winner }: { winner: number }) => {
  const { whiteUsername, blackUsername, whiteId, blackId } = useContext(GameContext)
  const winnerString = () => {
    if (winner == whiteId)
      return whiteUsername
    else if (winner == blackId)
      return blackUsername
  }
  return (
    <div>
      {
        winner != 0 ?
          <h3>Winner is {winnerString()}</h3>
          :
          <h3>Game resulted in a Draw</h3>
      }
    </div>
  )
}
