export const GameResult = ({ winner }: { winner: "w" | "b" | "d" }) => {
  let winnerString = ""
  switch (winner) {
    case "w":
      winnerString = "White"
      break
    case "b":
      winnerString = "Black"
      break
    default:
      break
  }
  return (
    <div>
      {
        winner != "d" ?
          <h3>Winner is {winnerString}</h3>
          :
          <h3>Game resulted in a Draw</h3>
      }
    </div>
  )
}
