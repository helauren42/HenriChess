import { useContext, useEffect, useState } from "react"
import "./Watch.css"
import { WsContext } from "../../Contexts/Ws"
import { Rank } from "../Play/Board"
import { addWaitCursor, removeWaitCursor } from "../../utils/utils"
import { useNavigate } from "react-router-dom"

interface GameWatchFace {
  id: number
  whiteUsername: string
  blackUsername: string
  whiteId: number
  blackId: number
  fen: string
}

export const WatchBoard = ({ fen, index }: { fen: string, index: number }) => {
  const nav = useNavigate()
  const boardFen = fen.split(" ")[0]
  const rankPieces = boardFen.split("/").reverse()
  console.log("RANK PIECES: ", rankPieces)
  const ranks = []
  let i = 7
  while (i >= 0 && i <= 7) {
    ranks.push(<Rank key={`key-rank-${i + 1}`} playerColor={"v"} rank={i + 1} pieces={rankPieces[i]} />)
    i -= 1
  }
  const navToGame = () => {
    nav(`/game/online/${index}`)
    location.reload()
  }
  return (
    <div className="mini-board" key={`mini-board-${index}`} onClick={() => navToGame()} >
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

const WatchGame = ({ blackUsername, whiteUsername, fen, id }: { blackUsername: string, whiteUsername: string, fen: string, id: number }) => {
  return (
    <div key={`mini-game-${id}`} className="mini-game">
      <MiniGameTitle blackUsername={blackUsername} whiteUsername={whiteUsername} ></MiniGameTitle>
      <WatchBoard fen={fen} index={id} />
    </div>
  )
}

export const GamesList = ({ games }: { games: GameWatchFace[] }) => {
  return (
    <div id="games-list">
      {
        games.map((game, index) => {
          return <WatchGame blackUsername={game.blackUsername} whiteUsername={game.whiteUsername} fen={game.fen} id={game.id} />
        })
      }
    </div>
  )
}

export const WatchPage = () => {
  const { ws, lastMessage } = useContext(WsContext)
  const [games, setGames] = useState<GameWatchFace[] | null>(null)
  const [loadingDots, setLoadingDots] = useState<"." | ".." | "...">(".")
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
