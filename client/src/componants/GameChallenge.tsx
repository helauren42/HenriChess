import { useContext, useEffect, useState } from "react"
import "./GameChallenge.css"
import { MscContext } from "../Contexts/Msc"
import { WsContext } from "../Contexts/Ws"

export const GameChallengeBox = () => {
  const { challenger, setChallenger } = useContext(MscContext)
  const { lastMessage } = useContext(WsContext)
  const [challengeId, setChallengeId] = useState<number>(0)
  useEffect(() => {
    console.log("here!!!!!!!!!!!!: ", lastMessage?.type)
    if (lastMessage && lastMessage.type == "gameChallenge") {
      const elem = document.getElementById("game-challenge-box")
      setChallengeId(lastMessage.id)
      setChallenger(lastMessage.challenger)
      if (elem == null)
        return
      elem.style.display = "flex"
      const id = setTimeout(() => {
        elem.style.display = "hidden"
      }, 10000)
      clearTimeout(id)
    }
  }, [lastMessage])
  return (
    <div id="game-challenge-box">
      <div className="w-full mt-5">
        <h2>Game Challenge</h2>
      </div>
      <p>You have been challenged to a game by {`${challenger}`}</p>
      <div className="flex justify-around">
        <div className="flex gap-5 mb-8">
          <button>Accept</button>
          <button>Decline</button>
        </div>
      </div>
    </div>
  )
}
