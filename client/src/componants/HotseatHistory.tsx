import { useNavigate } from "react-router-dom"
import "./GamesHistory.css"

export interface HotseatHistoryFace {
  id: number
  winnerName: "black" | "white"
  moveCount: number
  date: number
}

export const HotseatHistory = ({ hotseatHistory }: { hotseatHistory: HotseatHistoryFace[] }) => {
  const nav = useNavigate()
  const viewGame = (gameId: number) => {
    console.log("viewGame gameId: ", gameId)
    nav(`/play/hotseat/${gameId}`)
  }
  const historyReactArray = () => {
    const ret = hotseatHistory.map((game) => {
      console.log("date: ", game.date)
      const arr = (
        <tr key={game.id} id={`${game.id}`} className="game-history-row" onClick={() => viewGame(game.id)}>
          <td>
            {game.winnerName === "black" ? (
              <p className="text-(--text-color-dark)">BLACK</p>
            ) : (
              <p className="text-(--text-color-light)">WHITE</p>
            )}
          </td>
          <td className="">{game.moveCount}</td>
          <td className="">{new Date(game.date * 1000).toLocaleDateString()}</td>
        </tr>
      );
      return arr
    })
    document.getElementById("root")!.style.cursor = "auto"
    return ret
  }
  const noGamesYet = () => {
    document.getElementById("root")!.style.cursor = "auto"
    return (<p >No games yet</p>)
  }
  return (
    <div className="w-[80%] max-w-[900px] pb-15">
      <h4 className="game-history-title">
        Hotseat History
      </h4>
      {hotseatHistory.length === 0 ? noGamesYet() : (
        <table className="w-full border-separate">
          <thead className="">
            <tr className="history-header">
              <th className="">Winner</th>
              <th className="">Moves</th>
              <th className="">Date</th>
            </tr>
          </thead>
          <tbody>
            {historyReactArray()}
          </tbody>
        </table>
      )
      }
    </div >
  );
};
