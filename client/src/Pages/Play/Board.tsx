import { memo } from "react";
import { SQUARE } from "../../utils/Game";

const ranksBlacks = [8, 7, 6, 5, 4, 3, 2, 1] as const;
const filesBlacks = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const ranksWhites = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const filesWhites = [8, 7, 6, 5, 4, 3, 2, 1] as const;

export const Square = memo(({ square, rank, file }: { square: number, rank: number, file: number }) => {
  const color: "white" | "black" = (rank + file) % 2 == 0 ? "white" : "black"
  const fileName = () => {
    let path = "/images/"
    switch (square) {
      case 0:
        path += "whites/pawn"
        break
      case 6:
        path += "blacks/pawn"
        break
      case 1:
        path += "whites/knight"
        break
      case 7:
        path += "blacks/knight"
        break
      case 2:
        path += "whites/bishop"
        break
      case 8:
        path += "blacks/bishop"
        break
      case 3:
        path += "whites/rook"
        break
      case 9:
        path += "blacks/rook"
        break
      case 4:
        path += "whites/queen"
        break
      case 10:
        path += "blacks/queen"
        break
      case 5:
        path += "whites/king"
        break
      case 11:
        path += "blacks/king"
        break
      default:
        return undefined
    }
    path += "_wood_outline.svg"
    // console.log(path)
    return path
  }
  return (
    <span key={`${rank}-${file}`} id={`${rank}-${file}`} className={`square ${color == "white" ? "square-white" : "square-black"}`}>
      {/* <svg><use ></use></svg> */}
      <img src={square == SQUARE.EMPTY ? undefined : fileName()} />
    </span>)
})

export const Rank = memo(({ playerColor, board, rank }: { playerColor: "white" | "black", board: Int8Array, rank: number }) => {
  return (
    <div key={`rank${rank}`} id={`rank${rank}`} className="rank">
      {
        playerColor == "white" ?
          filesWhites.map((file) => {
            const pos = (rank - 1) * 8 + file - 1
            console.log(pos)
            return <Square square={board[pos]} rank={rank} file={file} />
          }) :
          filesBlacks.map((file) => {
            const pos = (rank - 1) * 8 + file - 1
            return <Square square={board[pos]} rank={rank} file={file} />
          })
      }
    </div>
  )
})

export const Board = ({ playerColor, board }: { playerColor: "white" | "black", board: Int8Array }) => {
  console.log("playerColor: ", playerColor)
  return (
    <div id="chessboard">
      {
        playerColor == "white" ?
          ranksWhites.map((val) => {
            return <Rank playerColor={playerColor} board={board} rank={val} />
          }) :
          ranksBlacks.map((val) => {
            return <Rank playerColor={playerColor} board={board} rank={val} />
          })
      }
    </div>
  )
}

