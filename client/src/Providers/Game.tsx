import { useEffect, useState, type ReactNode } from "react";
import { GameContext, type Pos, type SelectedFace } from "../Contexts/Game.tsx";
import { baseBoardBlack, baseBoardWhite, isBlack, isWhite } from "../utils/Game";

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const state = "inactive"
  const [board, setBoard] = useState<Int8Array>(baseBoardWhite)
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w")
  const [selected, setSelected] = useState<SelectedFace>({
    id: "",
    rank: 0,
    file: "",
  })
  const newBoard = () => {
    setPlayerColor(Math.random() >= 0.5 ? "w" : "b")
  }
  const getFileNum = (file: string) => {
    return file.charCodeAt(0) - 'a'.charCodeAt(0) + 1
  }
  const getSquare = (rank: number, file: string) => {
    const fileNum = getFileNum(file)
    const pos = (rank - 1) * 8 + fileNum - 1
    return board[pos]
  }
  const pieceIsPlayerColor = (newRank: number, newFile: string): boolean => {
    const square = getSquare(newRank, newFile)
    if (playerColor == "b" && isBlack(square))
      return true
    if (playerColor == "w" && isWhite(square))
      return true
    return false
  }
  const unselect = () => {
    const elem = document.getElementById(selected.id)
    elem!.style.filter = ""
    // if (elem!.className.includes("white"))
    //   elem!.style.backgroundColor = "rgb(222, 146, 90)"
    // else
    //   elem!.style.backgroundColor = "rgb(255, 242, 212)"
    setSelected({
      id: "",
      rank: 0,
      file: "",
    })
  }
  const squareClick = (id: string, makeMove: (source: Pos, dest: Pos) => void) => {
    // TODO add check that player clicks piece of appropriate color and type on first and second clicks
    const splitId = id.split("-")
    const newRank = parseInt(splitId[0])
    const newFile = splitId[1]
    console.log("selected: ", selected)
    console.log("newrank ", newRank)
    console.log("newFile ", newFile)
    if (selected.rank == newRank && selected.file == newFile) {
      unselect()
    }
    else if (selected.id == "" && pieceIsPlayerColor(newRank, newFile)) {
      setSelected({ id: id, rank: newRank, file: newFile })
    }
    else
      makeMove({ rank: selected.rank, file: selected.file }, { rank: newRank, file: newFile })
  }
  useEffect(() => {
    setBoard(playerColor == "w" ? baseBoardWhite : baseBoardBlack)
  }, [playerColor])
  useEffect(() => {
    if (selected.id.length > 0) {
      console.log("here")
      const elem = document.getElementById(selected.id)
      elem!.style.filter = "brightness(0.8)"
    }
  }, [selected])
  return (
    <GameContext.Provider value={{ state, board, setBoard, newBoard, playerColor, setPlayerColor, selected, setSelected, unselect, squareClick, getFileNum, getSquare }} >
      {children}
    </GameContext.Provider>
  )
}
