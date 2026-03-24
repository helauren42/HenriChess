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
    <div className="flex flex-row justify-between items-center pl-4 pr-4">
      <PlayerStatus status={playerState[2]} />
      <p title={playerState[0]} className="text-2xl">{playerState[0]}</p>
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
    <div className="">
      <div id="online-players-card">
        <div className="w-full bg-[rgb(210,160,140)] pt-4 pb-4 border-b">
          <h4 className="font-medium! text-center">Online players</h4>
        </div>
        {
          onlinePlayers.length <= 1 ?
            <NoOnlinePlayers /> :
            <div className="h-full">
              {
                onlinePlayers.map((val, index) => {
                  if (val[0] != user.username)
                    return <PlayerState key={`${index}`} playerState={val} />
                })
              }
            </div>
        }
      </div>
    </div>
  )
}

export const NoOnlinePlayers = () => {
  return (
    <div className="pt-10 pb-10">
      <p>There are no online players atm</p>
    </div>
  )
}
