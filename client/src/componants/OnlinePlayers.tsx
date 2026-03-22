import { useContext } from "react"
import checkmateImg from "../assets/checkmate.png"
import { WsContext } from "../Contexts/Ws"

import "./OnlinePlayers.css"
import { UserContext } from "../Contexts/User"

interface OnlinePlayersFace {
  onlinePlayers: []
}

const PlayerStatus = ({ status }: { status: number }) => {
  return (
    <>
      {
        status == 0 ?
          <div className="bg-green-700 w-3 h-3 rounded-[50%]" title="active"></div>
          : <div className="bg-red-700 w-3 h-3 rounded-[50%]" title="in game"></div>
      }
    </>
  )
}

// pos 0: player name, pos 1: player id, pos 2: player status
const PlayerState = ({ playerState }: { playerState: [string, number, number] }) => {
  const { ws } = useContext(WsContext)
  const sendChallenge = (opponentId: number) => {
    ws?.send(JSON.stringify({ "type": "sendChallenge", "opponentId": opponentId }))
    console.log("sendChallenge")
  }
  return (
    <div className="flex flex-row justify-between items-center">
      <PlayerStatus status={playerState[2]} />
      <p className="text-2xl">{playerState[0]}</p>
      {
        // active = 0, inGame = 1, TODO idle = 2
        playerState[2] != 1 ?
          <img src={checkmateImg} title="send challenge" className="w-7 cursor-pointer" onClick={() => sendChallenge(playerState[1])} />
          : <div className="w-7"></div>
      }
    </div>
  )
}

export const OnlinePlayers = ({ onlinePlayers }: OnlinePlayersFace) => {
  const { user } = useContext(UserContext)
  return (
    <div id="online-players-card">
      {
        onlinePlayers.map((val, index) => {
          if (val[0] != user.username)
            return <PlayerState key={`${index}`} playerState={val} />
        })
      }
    </div>
  )
}

export const NoOnlinePlayers = () => {
  return (
    <div className="pt-10 pb-10">
      <h4>There are no online players atm</h4>
    </div>
  )
}
