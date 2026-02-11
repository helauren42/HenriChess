import { useContext, useEffect, useState } from "react"
import "./Watch.css"
import { WsContext } from "../../Contexts/Ws"
import { Rank } from "../Play/Board"
import { addWaitCursor, removeWaitCursor } from "../../utils/utils"
import { clear } from "console"

interface GameWatchFace {
  id: number
  whiteUsername: string
  blackUsername: string
  whiteId: number
  blackId: number
  fen: string
}

export const MiniBoard = ({ fen, index }: { fen: string, index: number }) => {
  const boardFen = fen.split(" ")[0]
  const rankPieces = boardFen.split("/").reverse()
  console.log("RANK PIECES: ", rankPieces)
  const ranks = []
  let i = 7
  while (i >= 0 && i <= 7) {
    ranks.push(<Rank key={`key-rank-${i + 1}`} playerColor={"v"} rank={i + 1} pieces={rankPieces[i]} />)
    i -= 1
  }
  return (
    <div className="mini-board" key={`mini-board-${index}`} >
      {ranks}
    </div >
  )
}

const MiniGameTitle = ({ blackUsername, whiteUsername }: { blackUsername: string, whiteUsername: string }) => {
  return (
    <div className="flex flex-row gap-2 justify-center">
      <p>{blackUsername}</p>
      <p>vs</p>
      <p>{whiteUsername}</p>
    </div>
  )
}

const MiniGame = ({ blackUsername, whiteUsername, fen, index }: { blackUsername: string, whiteUsername: string, fen: string, index: number }) => {
  return (
    <div key={`mini-game-${index}`} className="mini-game">
      <MiniGameTitle blackUsername={blackUsername} whiteUsername={whiteUsername} ></MiniGameTitle>
      <MiniBoard fen={fen} index={index} />
    </div>
  )
}

export const GamesList = ({ games }: { games: GameWatchFace[] }) => {
  return (
    <div id="games-list">
      {
        games.map((game, index) => {
          return <MiniGame blackUsername={game.blackUsername} whiteUsername={game.whiteUsername} fen={game.fen} index={index} />
        })
      }
    </div>
  )
}

export const WatchPage = () => {
  const { ws, lastMessage } = useContext(WsContext)
  const [games, setGames] = useState<GameWatchFace[] | null>(null)
  const [loadingDots, setLoadingDots] = useState<"." | ".." | "...">(".")
  const [initialized, setInitialized] = useState<boolean>(false)
  useEffect(() => {
    ws?.send(JSON.stringify({ type: "getActiveGames" }))
    const id = setInterval(() => {
      addWaitCursor()
      console.log("WatchPage loop")
      ws?.send(JSON.stringify({ type: "getActiveGames" }))
    }, 5000)
    return () => clearInterval(id)
  }, [ws])
  useEffect(() => {
    if (lastMessage && lastMessage.type != undefined) {
      switch (lastMessage.type) {
        case "activeOnlineGames":
          setGames(lastMessage.games)
          removeWaitCursor()
          break
      }
    }
  }, [lastMessage])
  useEffect(() => {
    addWaitCursor()
  }, [])
  useEffect(() => {
    if (games == null) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => prev == "..." ? "." : prev + "." as ".")
      }, 200)
      return () => clearInterval(interval)
    }
  }, [games])
  useEffect(() => {
    console.log("initialized: ", initialized)
  }, [initialized])
  return (
    <div className="w-full flex flex-col text-center gap-10 mt-10">
      <h1>Watch Live Games</h1>
      <div className="w-full flex-row">
        {
          games ?
            games.length == 0 ?
              <h4> There are no active games currently</h4>
              : <GamesList games={games} />
            : <div className="flex text-left ml-[45%]">
              <h4>Loading{loadingDots}</h4>
            </div>
        }
      </div>
    </div >
  )
}
