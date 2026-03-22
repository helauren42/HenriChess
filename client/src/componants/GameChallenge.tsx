import { useContext, useEffect, useState } from "react"
import "./GameChallenge.css"
import { MscContext } from "../Contexts/Msc"
import { WsContext } from "../Contexts/Ws"

export const GameChallengeBox = () => {
  const { challenger, setChallenger } = useContext(MscContext)
  const { ws, lastMessage } = useContext(WsContext)
  const [challengeId, setChallengeId] = useState<number>(0)
  useEffect(() => {
    console.log("here!!!!!!!!!!!!: ", lastMessage?.type)
    if (lastMessage && lastMessage.type == "gameChallenge") {
      const elem = document.getElementById("game-challenge-box")
      setChallengeId(lastMessage.challengeId)
      setChallenger(lastMessage.challenger)
      if (elem == null)
        return
      elem.style.display = "flex"
      const id = setTimeout(() => {
        elem.style.display = "none"
        clearTimeout(id)
        // TODO add timebar
      }, 10000)
    }
  }, [lastMessage])
  const acceptChallenge = () => {
    ws?.send(JSON.stringify({ "type": "acceptChallenge", challengeId }))
    const elem = document.getElementById("game-challenge-box")
    if (elem)
      elem.style.display = "none"
  }
  const declineChallenge = () => {
    ws?.send(JSON.stringify({ "type": "declineChallenge", challengeId }))
    const elem = document.getElementById("game-challenge-box")
    if (elem)
      elem.style.display = "none"
  }
  return (
    <div id="game-challenge-box">
      <div className="w-full mt-5">
        <h2>Game Challenge</h2>
      </div>
      <p className="font-semibold text-xl">You have been challenged to a game by {`${challenger}`}</p>
      <div className="flex justify-around">
        <div className="flex gap-5 mb-8">
          <button onClick={() => acceptChallenge()}
            className="bg-(--button-red)!" style={{ "--shadow-color": "var(--button-red)" }}>
            Accept
          </button>
          <button onClick={() => declineChallenge()}
            className="bg-(--button-green)!" style={{ "--shadow-color": "var(--button-green)" }}>Decline</button>
        </div>
      </div>
    </div>
  )
}
