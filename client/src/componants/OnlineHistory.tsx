import { useNavigate } from "react-router-dom";
import "./GamesHistory.css";

export interface OnlineHistoryFace {
  id: number;
  winnerName: string;
  blackUsername: string;
  whiteUsername: string;
  blackId: number;
  whiteId: number;
  moveCount: number;
  date: number;
}

export const OnlineHistory = ({ onlineHistory }: { onlineHistory: OnlineHistoryFace[] }) => {
  const navigate = useNavigate();

  const viewGame = (gameId: number) => {
    navigate(`/play/online/${gameId}`);
  };

  return (
    <div className="w-[80%] max-w-[900px]">
      <h4 className="game-history-title">Online History</h4>

      {onlineHistory.length === 0 ? (
        <p>No games yet</p>
      ) : (
        <table className="w-full border-separate">
          <thead>
            <tr className="history-header">
              <th>Players</th>
              <th>Winner</th>
              <th>Moves</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {onlineHistory.map((game) => {
              const isBlackWinner = game.winnerName === game.blackUsername;
              return (
                <tr key={game.id} id={`${game.id}`} className="game-history-row" onClick={() => viewGame(game.id)} >
                  <td>
                    <div className="flex flex-col">
                      <span className="text-(--text-color-dark)">{game.blackUsername}</span>
                      <span className="text-(--text-color-light)">{game.whiteUsername}</span>
                    </div>
                  </td>
                  <td>
                    {isBlackWinner ? (
                      <span className="text-(--text-color-dark)">{game.blackUsername}</span>
                    ) : (
                      <span className="text-(--text-color-light)">{game.whiteUsername}</span>
                    )}
                  </td>
                  <td>{game.moveCount}</td>
                  <td>{new Date(game.date * 1000).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
