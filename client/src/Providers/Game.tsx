import { useContext, useEffect, useState, type ReactNode } from "react";
import { GameContext, type GameUpdateFace, type GameMoveFace, type SelectedFace } from "../Contexts/Game.tsx";
import { isBlack, isWhite } from "../utils/Game";
import { INITIAL_BOARD, SERVER_URL_WS } from "../utils/const.tsx";
import { ToastCustomError } from "../utils/toastify.tsx";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Contexts/User.tsx";

export interface DataGame {
  "type": "game",
  "mode": "online" | "hotseat",
  "subtype": "new" | "continue" | "update",
  "game": GameUpdateFace,
  "id": number
}

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(UserContext)
  const [gameId, setGameId] = useState<number | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  // const ws = useRef<WebSocket | null>(null)
  const [board, setBoard] = useState<string>(INITIAL_BOARD)
  const [mode, setMode] = useState<"hotseat" | "online">("hotseat")
  const [gameFens, setGameFens] = useState<string[]>([])
  const [gameMoves, setGameMoves] = useState<GameMoveFace[]>([])
  const [playerColor, setPlayerColor] = useState<"w" | "b" | "v">("w")
  const [playerTurn, setPlayerTurn] = useState<"w" | "b">("w")
  const [whiteUsername, setWhiteUsername] = useState<string>("")
  const [blackUsername, setBlackUsername] = useState<string>("")
  const [winner, setWinner] = useState<"w" | "b" | "d" | "">("")
  const [selected, setSelected] = useState<SelectedFace>({
    id: "",
    rank: 0,
    file: "",
  })
  useEffect(() => {
    console.log("!!! user INSIDE game provider: ", user)
  }, [user])
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
    if (!ws)
      return wsErrorNotOpen("make move")
    const rawData = {
      type: "clientMove",
      uciMove: uciMove,
      mode: mode,
      gameId: gameId,
      opponentName: user.username == whiteUsername ? blackUsername : whiteUsername
    }
    console.log(rawData)
    const stringData = JSON.stringify(rawData)
    ws.send(stringData)
    return true
  }
  // ws messages
  const squareClick = (id: string, piece: string) => {
    if (winner != "")
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
    if (!ws || ws.readyState != ws.OPEN) {
      const id = setInterval(() => {
        if (ws && ws.readyState === ws.OPEN) {
          ws?.send(JSON.stringify({ type: "getGameUpdate", mode, "gameId": tempId ? tempId : gameId }))
          clearInterval(id)
          return
        }
      }, 100)
    }
    else {
      ws?.send(JSON.stringify({ type: "getGameUpdate", mode, gameId }))
    }
  }
  const parseGame = (data: DataGame) => {
    const game: GameUpdateFace = data.game
    const lastIndex = game.gameFens.length - 1
    setGameFens(game.gameFens)
    setGameMoves(game.gameMoves)
    setWinner(game.winner)
    setGameId(game.id)
    setWhiteUsername(game.whiteUsername)
    setBlackUsername(game.blackUsername)
    setMode(data.mode)
    const turnColor: "w" | "b" = game.gameFens[lastIndex].split(" ")[1] as "w" | "b"
    setPlayerTurn(turnColor)
    if (user.username == game.blackUsername)
      setPlayerColor("b")
    else if (user.username == game.whiteUsername)
      setPlayerColor("w")
    else
      setPlayerColor("v")
    console.log("game: ", game)
    const currBoard = game.gameFens[lastIndex].split(" ")[0]
    console.log("currBoard: ", currBoard)
    setBoard(currBoard)
    const gamePath = "/play/" + data.mode + "/" + data.id
    const pathname = window.location.pathname
    if (pathname != gamePath)
      nav(gamePath)
    if (data.subtype as string == "continue")
      console.log("!!!prompt user whether he wants to continue or start new game") // TODO
  }
  const restartGame = () => {
    if (!ws)
      return wsErrorNotOpen("re start game")
    const fullType = "restartGame" + mode[0].toUpperCase() + mode.slice(1)
    console.log(fullType)
    ws.send(JSON.stringify({ type: fullType }))
  }
  const startGameHotseat = () => {
    if (!ws)
      return wsErrorNotOpen("start game hotseat")
    const fullType = "startGame" + mode[0].toUpperCase() + mode.slice(1)
    console.log(fullType)
    ws.send(JSON.stringify({ type: fullType }))
  }
  const resignGame = () => {
    if (!ws)
      return wsErrorNotOpen("resign game")
    ws.send(JSON.stringify({
      type: "resignGame",
      gameId,
      mode,
      playerColor
    }))
  }
  const startMatchmaking = () => {
    if (!ws)
      return wsErrorNotOpen("startMatchmaking")
    ws.send(JSON.stringify({
      type: "startMatchmaking"
    }))
  }
  const endMatchmaking = () => {
    if (!ws)
      return wsErrorNotOpen("endMatchmaking")
    ws.send(JSON.stringify({
      type: "endMatchmaking"
    }))
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
    console.log("ws has updated: ", ws)
  }, [ws])
  const makeSocket = () => {
    const sock = new WebSocket(SERVER_URL_WS)
    const timeout = setTimeout(() => {
      if (sock.readyState != sock.OPEN)
        sock.close()
    }, 4000)

    sock.onopen = (e) => {
      clearTimeout(timeout)
      console.log("websocket on open: ", e)
      setWs(sock)
    }

    sock.onerror = (e) => {
      clearTimeout(timeout)
      console.error("websocket on error: ", e)
    }

    sock.onclose = (e) => {
      clearTimeout(timeout)
      console.log("websocket on close: ", e)
      ws?.close()
      setWs(null)
    };

    sock.onmessage = (event) => {
      const data: Record<string, any> = JSON.parse(event.data)
      ws?.send(JSON.stringify({ type: "getActiveGames" }))
      console.log('Message from server: ', data)
      switch (data.type) {
        case "game":
          parseGame(data as DataGame)
          break
        case "gameMessage":
          break
        case "activeGames":
          break
      }
    }
  };
  useEffect(() => {
    if (ws == null || ws?.readyState == ws?.CLOSED || ws?.readyState == ws.CLOSING) {
      const id = setTimeout(() => {
        makeSocket()
      }, 1000)
      return () => clearTimeout(id)
    }
  }, [ws, user])
  useEffect(() => {
    console.log("new gameId value: ", gameId)
  }, [gameId])
  return (
    <GameContext.Provider value={{ ws, setWs, gameId, setGameId, board, setBoard, mode, setMode, gameFens, setGameFens, gameMoves, setGameMoves, getGameUpdate, playerColor, setPlayerColor, playerTurn, setPlayerTurn, whiteUsername, setWhiteUsername, blackUsername, setBlackUsername, winner, setWinner, selected, setSelected, unselect, squareClick, getFileNum, clientMove, restartGame, startGameHotseat, resignGame, startMatchmaking, endMatchmaking }} >
      {children}
    </GameContext.Provider>
  )
}
