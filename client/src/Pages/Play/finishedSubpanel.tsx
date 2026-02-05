import { useContext } from "react"
import { GameContext } from "../../Contexts/Game"

const GameResult = ({ winner }: { winner: number }) => {
  const { winnerName } = useContext(GameContext)
  return (
    <div>
      {
        winner != 0 ?
          <h3>Winner is {winnerName}</h3>
          :
          <h3>Game resulted in a Draw</h3>
      }
    </div>
  )
}

const ChangeFen = () => {
  return (
    <>
    </>
  )
}

export const FinishedSubpanel = () => {
  const { winner } = useContext(GameContext)
  return (
    <>
      {
        winner != null ?
          <>
            <GameResult winner={winner} />
            <ChangeFen />
          </>
          : null
      }
    </>
  )

}
