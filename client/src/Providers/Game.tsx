import { useEffect, useRef, useState, type ReactNode } from "react";
import { GameContext, type GameUpdateFace, type GameMoveFace, type SelectedFace } from "../Contexts/Game.tsx";
import { isBlack, isWhite } from "../utils/Game";
import { INITIAL_BOARD, SERVER_URL_WS } from "../utils/const.tsx";
import { ToastCustomError } from "../utils/toastify.tsx";
import { useNavigate } from "react-router-dom";

export interface DataGame {
  "type": "game",
  "mode": "online" | "hotseat",
  "subtype": "new" | "continue" | "update",
  "game": GameUpdateFace,
  "id": number
}

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameId, setGameId] = useState<number | null>(null)
  // const [ws, setWs] = useState<WebSocket>(new WebSocket(SERVER_URL_WS))
  const ws = useRef<WebSocket | null>(null)
  const [board, setBoard] = useState<string>(INITIAL_BOARD)
  const [mode, setMode] = useState<"hotseat" | "online">("hotseat")
  const [gameFens, setGameFens] = useState<string[]>([])
  const [gameMoves, setGameMoves] = useState<GameMoveFace[]>([])
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w")
  const [playerTurn, setPlayerTurn] = useState<"w" | "b">("w")
  const [winner, setWinner] = useState<"w" | "b" | "d" | null>(null)
  const [selected, setSelected] = useState<SelectedFace>({
    id: "",
    rank: 0,
    file: "",
  })
  // not for context
  const nav = useNavigate()
  // functions
  const getFileNum = (file: string) => {
    return file.charCodeAt(0) - 'a'.charCodeAt(0) + 1
  }
  const pieceIsPlayerColor = (piece: string): boolean => {
    if (playerColor == "b" && isBlack(piece))
      return true
    else if (playerColor == "w" && isWhite(piece))
      return true
    return false
  }
  const unselect = () => {
    const elem = document.getElementById(selected.id)
    elem!.style.filter = ""
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
  const clientMove = (uciMove: string) => {
    if (!ws.current)
      return wsErrorNotOpen("make move")
    const rawData = {
      type: "clientMove",
      uciMove: uciMove,
      mode: mode,
      gameId: gameId
    }
    const stringData = JSON.stringify(rawData)
    ws.current.send(stringData)
    return true
  }
  // ws messages
  const squareClick = (id: string, piece: string) => {
    if (winner != null)
      return
    // TODO add check that player clicks piece of appropriate color and type on first and second clicks
    const newRank = parseInt(id[0])
    const newFile = id[2]
    if (selected.rank == newRank && selected.file == newFile) {
      unselect()
    }
    else if (selected.id == "" && pieceIsPlayerColor(piece)) {
      setSelected({ id: id, rank: newRank, file: newFile })
    }
    else if (selected.id.length > 0) {
      clientMove(selected.file + selected.rank + newFile + newRank)
      unselect()
    }
  }
  const getGameUpdate = (tempId: number | null = null) => {
    console.log("getGameUpdate")
    if (!ws.current || ws.current.readyState != ws.current.OPEN) {
      console.log("not ready")
      const id = setInterval(() => {
        if (ws.current && ws.current.readyState === ws.current.OPEN) {
          console.log("finally ready")
          console.log("gameId: ", gameId)
          ws.current?.send(JSON.stringify({ type: "getGameUpdate", mode, "gameId": tempId ? tempId : gameId }))
          clearInterval(id)
          return
        }
      }, 100)
    }
    else {
      console.log("is ready")
      console.log("gameId: ", gameId)
      ws.current?.send(JSON.stringify({ type: "getGameUpdate", mode, gameId }))
    }
  }
  const startGame = (type: "hotseat" | "online") => {
    if (!ws.current)
      return wsErrorNotOpen("start game")
    const fullType = "startGame" + type[0].toUpperCase() + type.slice(1)
    console.log(fullType)
    ws.current.send(JSON.stringify({ type: fullType }))
  }
  const parseGame = (data: DataGame) => {
    const game: GameUpdateFace = data.game
    setGameFens(game.gameFens)
    setGameMoves(game.gameMoves)
    setWinner(game.winner)
    console.log("game Id from parse Game: ", game.id)
    setGameId(game.id)
    const gameGensLen = game.gameFens.length
    if (gameGensLen % 2 == 0) {
      setPlayerTurn("b")
      if (data.mode == "hotseat")
        setPlayerColor("b")
    }
    else {
      setPlayerTurn("w")
      if (data.mode == "hotseat")
        setPlayerColor("w")
    }
    console.log("game: ", game)
    const currBoard = game.gameFens[gameGensLen - 1].split(" ")[0]
    console.log("currBoard: ", currBoard)
    setBoard(currBoard)
    const gamePath = "/play/" + data.mode + "/" + data.id
    const pathname = window.location.pathname
    if (pathname != gamePath)
      nav(gamePath)
    if (data.subtype as string == "continue")
      console.log("!!!prompt user whether he wants to continue or start new game") // TODO
  }
  useEffect(() => {
    console.log("!!! winner: ", winner)
  }, [winner])
  useEffect(() => {
    console.log("board: ", board)
  }, [board])
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
        const data: Record<string, any> = JSON.parse(event.data)
        console.log('Message from server: ', data)
        switch (data.type) {
          case "game":
            parseGame(data as DataGame)
            break
          case "gameMessage":
            break
        }
      }

      sock.onerror = (e) => {
        console.error("websocket on error: ", e)
      }

      sock.onclose = (e) => {
        console.log("websocket on close: ", e)
        ws.current?.close()
        ws.current = null
        setTimeout(makeSocket, 1000)
      };

      ws.current = sock
    };

    makeSocket()
  }, [])
  useEffect(() => {
    console.log("new gameId value: ", gameId)
  }, [gameId])
  return (
    <GameContext.Provider value={{ ws, gameId, setGameId, board, setBoard, mode, setMode, gameFens, setGameFens, gameMoves, setGameMoves, getGameUpdate, playerColor, setPlayerColor, playerTurn, setPlayerTurn, winner, setWinner, selected, setSelected, unselect, squareClick, getFileNum, clientMove, startGame }} >
      {children}
    </GameContext.Provider>
  )
}
