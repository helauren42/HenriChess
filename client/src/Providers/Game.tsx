import { useEffect, useRef, useState, type ReactNode } from "react";
import { GameContext, type GameFace, type GameUpdateFace, type GameMoveFace, type Pos, type SelectedFace } from "../Contexts/Game.tsx";
import { isBlack, isWhite } from "../utils/Game";
import { INITIAL_BOARD, SERVER_URL_WS } from "../utils/const.tsx";
import { ToastCustomError } from "../utils/toastify.tsx";
import { useLocation, useNavigate } from "react-router-dom";

export interface DataGame {
  "type": "game",
  "mode": "online" | "hotseat",
  "subtype": "new" | "continue" | "update",
  "game": GameUpdateFace,
  "id": number
}

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameId, setGameId] = useState<string | null>(null)
  // const [ws, setWs] = useState<WebSocket>(new WebSocket(SERVER_URL_WS))
  const ws = useRef<WebSocket | null>(null)
  const [board, setBoard] = useState<string>(INITIAL_BOARD)
  const [gameFens, setGameFens] = useState<string[]>([])
  const [gameMoves, setGameMoves] = useState<GameMoveFace[]>([])
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w")
  const [selected, setSelected] = useState<SelectedFace>({
    id: "",
    rank: 0,
    file: "",
  })
  // not for context
  const location = useLocation()
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
  const clientMove = (src: Pos, dest: Pos) => {
    if (!ws.current)
      return wsErrorNotOpen("start game")
    const rawData = {
      type: "clientMove",
      src,
      dest
    }
    const stringData = JSON.stringify(rawData)
    ws.current.send(stringData)
    return true
  }
  // ws messages
  const squareClick = (id: string, piece: string) => {
    // TODO add check that player clicks piece of appropriate color and type on first and second clicks
    const splitId = id.split("-")
    const newRank = parseInt(splitId[0])
    const newFile = splitId[1]
    if (selected.rank == newRank && selected.file == newFile) {
      unselect()
    }
    else if (selected.id == "" && pieceIsPlayerColor(piece)) {
      setSelected({ id: id, rank: newRank, file: newFile })
    }
    else if (selected.id.length > 0) {
      clientMove({ rank: selected.rank, file: selected.file }, { rank: newRank, file: newFile })
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
  const parseGame = (data: DataGame) => {
    const game: GameUpdateFace = data.game
    setGameFens(game.gameFens)
    setGameMoves(game.gameMoves)
    const currBoard = game.gameFens[game.gameFens.length - 1].split(" ")[0]
    console.log("currBoard: ", currBoard)
    if (game.gameFens.length > 0) {
      setBoard(currBoard)
    }
    const gamePath = "/play/" + data.mode + "/" + data.id
    if (location.pathname != gamePath)
      nav(gamePath)
    if (data.subtype as string == "continue")
      console.log("!!!prompt user whether he wants to continue or start new game") // TODO
  }
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
        console.log('Message from server:', event.data)
        const data: Record<string, any> = JSON.parse(event.data)
        switch (data.type) {
          case "game":
            parseGame(data as DataGame)
            break
          // case "gameMessage":
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
  return (
    <GameContext.Provider value={{ ws, gameId, setGameId, board, setBoard, gameFens, setGameFens, gameMoves, setGameMoves, playerColor, setPlayerColor, selected, setSelected, unselect, squareClick, getFileNum, clientMove, startGame }} >
      {children}
    </GameContext.Provider>
  )
}
