import { memo, useContext } from "react";
import { SQUARE } from "../../utils/const.tsx";
import { GameContext, type Pos } from "../../Contexts/Game";

const ranksWhites = [8, 7, 6, 5, 4, 3, 2, 1] as const;
const filesBlacks = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const ranksBlacks = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const filesWhites = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export const Square = memo(({ square, rank, file }: { square: number, rank: number, file: string }) => {
  const { squareClick, getFileNum } = useContext(GameContext)
  const squareColor: "white" | "black" = (rank + getFileNum(file)) % 2 == 0 ? "white" : "black"
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
  const makeMove = async (src: Pos, dest: Pos) => {
    return
  }
  const handleClick = (id: string) => {
    squareClick(id, makeMove)
  }
  return (
    <span onClick={(e) => handleClick(e.currentTarget.id)} key={`${rank}-${file}`} id={`${rank}-${file}`} className={`square ${squareColor == "white" ? "square-white" : "square-black"}`}>
      {/* <svg><use ></use></svg> */}
      <img src={square == SQUARE.EMPTY ? undefined : fileName()} />
    </span>)
})

export const Rank = memo(({ playerColor, rank }: { playerColor: "w" | "b", rank: number }) => {
  const { getSquare } = useContext(GameContext)
  return (
    <div key={`rank${rank}`} id={`rank${rank}`} className="rank">
      {
        playerColor == "w" ?
          filesWhites.map((file) => {
            return <Square square={getSquare(rank, file)} rank={rank} file={file} />
          }) :
          filesBlacks.map((file) => {
            return <Square square={getSquare(rank, file)} rank={rank} file={file} />
          })
      }
    </div>
  )
})

export const Board = ({ playerColor, board }: { playerColor: "w" | "b", board: Int8Array }) => {
  console.log("playerColor: ", playerColor)
  return (
    <div id="chessboard">
      {
        playerColor == "w" ?
          ranksWhites.map((val) => {
            return <Rank playerColor={playerColor} rank={val} />
          }) :
          ranksBlacks.map((val) => {
            return <Rank playerColor={playerColor} rank={val} />
          })
      }
    </div>
  )
}

