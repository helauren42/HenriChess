import { useContext } from "react"
import { GameContext } from "../../Contexts/Game"

export const GameResult = ({ winner }: { winner: number }) => {
  const { whiteUsername, blackUsername, whiteId, blackId } = useContext(GameContext)
  let winnerString = ""
  if (winner == whiteId)
    winnerString = whiteUsername
  if (winner == blackId)
    winnerString = blackUsername
  return (
    <div>
      {
        winner ?
          <h3>Winner is {winnerString}</h3>
          :
          <h3>Game resulted in a Draw</h3>
      }
    </div>
  )
}
