import { useContext, type ReactNode } from "react"
import "./Panel.css"
import { GameContext } from "../../Contexts/Game"
import { useNavigate } from "react-router-dom"

interface GameModeBlockFace {
  title: string
  subtitle: string
  handleClick: () => void
}

const GameModeBlock = ({ title, subtitle, handleClick }: GameModeBlockFace) => {
  return (
    <div className="game-mode-block" onClick={handleClick}>
      <h3>{title}</h3>
      <p className="font-medium text-xl">{subtitle}</p>
    </div>
  )
}

const GameModes = () => {
  const { startGameHotseat } = useContext(GameContext)
  const nav = useNavigate()
  return (
    <div className="h-full pt-10 flex flex-col gap-10">
      <GameModeBlock title="Play Online" subtitle="Random Matchmaking" handleClick={() => {
        console.log("clicked play online")
        nav("/play/matchmake-online")
      }} />
      <GameModeBlock title="Play Hotseat" subtitle="Play on your computer" handleClick={() => {
        console.log("clicked play hotseat")
        startGameHotseat()
      }} />
    </div>
  )
}

export const ChooseGame = () => {
  return (
    <>
      <h3>Choose Game</h3>
      <GameModes />
    </>
  )
}

export const Panel = ({ children }: { children: ReactNode }) => {
  return (
    <div id="play-panel" className="base-layer" >
      {children}
    </div>
  )
}
