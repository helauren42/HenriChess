import { useContext, useEffect, type ReactNode } from "react"
import { GameContext } from "../Contexts/Game"

interface BaseModalFace {
  title: string
  text: string
  actionButton: ReactNode | null
}

const BaseModal = ({ title, text, actionButton }: BaseModalFace) => {
  const { setGameExpired } = useContext(GameContext)
  return (
    <div id="base-modal" className="flex flex-col justify-between absolute top-[25%] left-[25%]  w-[50%] h-[50%] min-w-[300px] min-h-[400] rounded-lg text-center bg-(--bg-color-light)">
      <div id="top-bar" className="flex flex-row justify-between">
        <div id="ghost" className="w-10"></div>
        <h3 id="title">{title}</h3>
        <button onClick={() => { setGameExpired(false) }}>x</button>
      </div>
      <h5>{text}</h5>
      {
        actionButton != null ?
          actionButton
          : <div></div>
      }
    </div >
  )
}

const GameExpiredButton = () => {
  const { startGameHotseat, setGameExpired } = useContext(GameContext)
  return (
    <button onClick={() => { setGameExpired(false); startGameHotseat() }
    }> Replay</button >
  )
}

export const GameExpired = () => {
  const { gameExpired } = useContext(GameContext)
  useEffect(() => {
    console.log("GAMEEXPIRED: ", gameExpired)
    const elem: HTMLDialogElement | null = document.getElementById("base-modal") as HTMLDialogElement | null
    if (elem == null)
      return
    if (gameExpired)
      elem.style.display = "flex"
    else
      elem.style.display = "none"
  }, [gameExpired])
  return (
    <>
      <BaseModal title="Game Expired" text="Games expire after 20 mins of inactivity" actionButton={<GameExpiredButton />} />
    </>
  )
}
