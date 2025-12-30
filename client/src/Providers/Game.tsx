import { useEffect, useRef, useState, type ReactNode } from "react";
import { GameContext, type Pos, type SelectedFace } from "../Contexts/Game.tsx";
import { baseBoardBlack, baseBoardWhite, isBlack, isWhite } from "../utils/Game";
import { SERVER_URL_WS } from "../utils/const.tsx";
import { ToastCustomError } from "../utils/toastify.tsx";

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameId, setGameId] = useState<string | null>(null)
  // const [ws, setWs] = useState<WebSocket>(new WebSocket(SERVER_URL_WS))
  const ws = useRef<WebSocket | null>(null)
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
  const wsErrorNotOpen = (action: string) => {
    ToastCustomError("Connection error failed to " + action)
    console.error("websocket not open error, failed to " + action)
  }
  const gameMove = (src: Pos, dest: Pos) => {
    if (!ws.current)
      return wsErrorNotOpen("start game")
    const rawData = {
      type: "gameMove",
      src,
      dest
    }
    const stringData = JSON.stringify(rawData)
    ws.current.send(stringData)
    return true
  }
  // ws messages
  const squareClick = (id: string) => {
    // TODO add check that player clicks piece of appropriate color and type on first and second clicks
    const splitId = id.split("-")
    const newRank = parseInt(splitId[0])
    const newFile = splitId[1]
    if (selected.rank == newRank && selected.file == newFile) {
      unselect()
    }
    else if (selected.id == "" && pieceIsPlayerColor(newRank, newFile)) {
      setSelected({ id: id, rank: newRank, file: newFile })
    }
    else if (selected.id.length > 0) {
      gameMove({ rank: selected.rank, file: selected.file }, { rank: newRank, file: newFile })
      unselect()
    }
  }
  const startGame = (type: "hotseat" | "online") => {
    if (!ws.current)
      return wsErrorNotOpen("start game")
    const fullType = "startGame" + type[0].toUpperCase() + type.slice(1)
    console.log(fullType)
    ws.current.send(JSON.stringify({ type: fullType }))
  }
  useEffect(() => {
    setBoard(playerColor == "w" ? baseBoardWhite : baseBoardBlack)
  }, [playerColor])
  useEffect(() => {
    if (selected.id.length > 0) {
      const elem = document.getElementById(selected.id)
      elem!.style.filter = "brightness(0.8)"
    }
  }, [selected])
  useEffect(() => {
    const makeSocket = () => {
      const sock = new WebSocket(SERVER_URL_WS)
      sock.onopen = (e) => {
        console.log("websocket on open: ", e)
      }
      sock.onmessage = (event) => {
        console.log('Message from server:', event.data);
        // hadnleMessages(event.data);
      };
      sock.onerror = (e) => {
        console.error("websocket on error: ", e)
      }
      sock.onclose = (e) => {
        console.log("websocket on close: ", e)
        ws.current?.close()
        ws.current = null
        setTimeout(makeSocket, 1000)
        return
      }
      ws.current = sock
    }
    makeSocket()
  }, [])
  return (
    <GameContext.Provider value={{ ws, gameId, setGameId, board, setBoard, playerColor, setPlayerColor, selected, setSelected, unselect, squareClick, getFileNum, getSquare, gameMove, startGame }} >
      {children}
    </GameContext.Provider>
  )
}
