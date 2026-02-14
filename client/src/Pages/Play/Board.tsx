import { memo, useContext, useEffect, useState } from "react";
import { GameContext } from "../../Contexts/Game";
import { INITIAL_BOARD } from "../../utils/const";

export const Square = memo(({ piece, rank, file, viewer = false }: { piece: string, rank: number, file: string, viewer: boolean }) => {
  const { squareClick, getFileNum } = useContext(GameContext)
  const squareColor: "white" | "black" = (rank + getFileNum(file)) % 2 == 0 ? "white" : "black"
  // console.log("square ", rank, "-", file, ": ", piece)
  const fileName = () => {
    let path = "/images/"
    switch (piece) {
      case "P":
        path += "whites/pawn"
        break
      case "p":
        path += "blacks/pawn"
        break
      case "N":
        path += "whites/knight"
        break
      case "n":
        path += "blacks/knight"
        break
      case "B":
        path += "whites/bishop"
        break
      case "b":
        path += "blacks/bishop"
        break
      case "R":
        path += "whites/rook"
        break
      case "r":
        path += "blacks/rook"
        break
      case "Q":
        path += "whites/queen"
        break
      case "q":
        path += "blacks/queen"
        break
      case "K":
        path += "whites/king"
        break
      case "k":
        path += "blacks/king"
        break
      default:
        return undefined
    }
    path += "_wood_outline.svg"
    return path
  }
  const handleClick = (id: string) => {
    if (viewer)
      return
    squareClick(id, piece)
  }
  return (
    <span onClick={viewer ? undefined : (e) => handleClick(e.currentTarget.id)} id={`${rank}-${file}`} className={`square ${squareColor == "white" ? "square-white" : "square-black"}`}>
      {/* <svg><use ></use></svg> */}
      <img src={piece == "" ? undefined : fileName()} />
    </span>)
})

export const Rank = memo(({ playerColor, rank, pieces }: { playerColor: "w" | "b" | "v", rank: number, pieces: string }) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const incr = playerColor != "b" ? 1 : -1
  const squares = []
  let i: number = playerColor != "b" ? 0 : pieces.length - 1
  let fileIndex: number = playerColor != "b" ? 0 : 7
  while (i >= 0 && i < pieces.length) {
    const emptySquares: number = pieces.charCodeAt(i)
    // if it is a digit, the digit represents the number of empty squares on the rank
    if (emptySquares >= 48 && emptySquares <= 57) {
      for (let j = 48; j < emptySquares; j++) {
        const file = files[fileIndex]
        squares.push(
          <Square key={`square-${rank}-${file}`} piece={""} rank={rank} file={file} viewer={playerColor == "v" ? true : false} />
        )
        fileIndex += incr
      }
    }
    else {
      const file = files[fileIndex]
      squares.push(
        <Square key={`square-${rank}-${file}`} piece={pieces[i]} rank={rank} file={file} viewer={playerColor == "v" ? true : false} />
      )
      fileIndex += incr
    }
    i += incr
  }
  return (
    <div id={`rank${rank}`} className="rank">
      {squares}
    </div>
  )
})

export const Board = ({ playerColor }: { playerColor: "w" | "b" | "v" }) => {
  const { board } = useContext(GameContext)
  const rankPieces = board.split("/").reverse()
  const iIncr = playerColor == "w" || playerColor == "v" ? -1 : 1
  const firstRank = playerColor == "w" || playerColor == "v" ? 7 : 0
  const ranks = []
  let i = firstRank
  while (i >= 0 && i <= 7) {
    ranks.push(<Rank key={`key-rank-${i + 1}`} playerColor={playerColor} rank={i + 1} pieces={rankPieces[i]} />)
    i += iIncr
  }
  return (
    <div id="chessboard">
      {ranks}
    </div>
  )
}

export const PassiveSquare = memo(({ piece, rank, file }: { piece: string, rank: number, file: string }) => {
  const { getFileNum } = useContext(GameContext)
  const squareColor: "white" | "black" = (rank + getFileNum(file)) % 2 == 0 ? "white" : "black"
  // console.log("square ", rank, "-", file, ": ", piece)
  const fileName = () => {
    let path = "/images/"
    switch (piece) {
      case "P":
        path += "whites/pawn"
        break
      case "p":
        path += "blacks/pawn"
        break
      case "N":
        path += "whites/knight"
        break
      case "n":
        path += "blacks/knight"
        break
      case "B":
        path += "whites/bishop"
        break
      case "b":
        path += "blacks/bishop"
        break
      case "R":
        path += "whites/rook"
        break
      case "r":
        path += "blacks/rook"
        break
      case "Q":
        path += "whites/queen"
        break
      case "q":
        path += "blacks/queen"
        break
      case "K":
        path += "whites/king"
        break
      case "k":
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
    <span id={`${rank}-${file}`} className={`square ${squareColor == "white" ? "square-white" : "square-black"}`}>
      <img src={piece == "" ? undefined : fileName()} />
    </span>)
})

export const PassiveRank = memo(({ rank, pieces }: { rank: number, pieces: string }) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const incr = 1
  const squares = []
  let i: number = 0
  let fileIndex: number = 0
  while (i >= 0 && i < pieces.length) {
    const emptySquares: number = pieces.charCodeAt(i)
    // if it is a digit, the digit represents the number of empty squares on the rank
    if (emptySquares >= 48 && emptySquares <= 57) {
      console.log(emptySquares)
      for (let j = 48; j < emptySquares; j++) {
        const file = files[fileIndex]
        squares.push(
          <PassiveSquare key={`square-${rank}-${file}`} piece={""} rank={rank} file={file} />
        )
        fileIndex += incr
      }
    }
    else {
      const file = files[fileIndex]
      squares.push(
        <PassiveSquare key={`square-${rank}-${file}`} piece={pieces[i]} rank={rank} file={file} />
      )
      fileIndex += incr
    }
    i += incr
  }
  return (
    <div id={`rank${rank}`} className="rank">
      {squares}
    </div>
  )
})

export const PassiveBoard = () => {
  const [width, setWidth] = useState(window.innerWidth)
  const board = INITIAL_BOARD
  const rankPieces = board.split("/").reverse()
  const iIncr = -1
  const firstRank = 7
  const ranks = []
  let i = firstRank
  while (i >= 0 && i <= 7) {
    ranks.push(<PassiveRank key={`key-rank-${i + 1}`} rank={i + 1} pieces={rankPieces[i]} />)
    i += iIncr
  }
  useEffect(() => {
    const elem = document.getElementById("play-board")
    if (elem)
      if (width < 1200)
        elem.style.display = "none"
      else
        elem.style.display = "flex"
  }, [width])
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
  }, [])
  return (
    <div id="play-board">
      <div id="chessboard">
        {ranks}
      </div>
    </div>
  )
}

