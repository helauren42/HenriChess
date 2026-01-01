import { useContext } from "react"
import "./Panel.css"
import { GameContext } from "../../Contexts/Game"
import { Outlet } from "react-router-dom"

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

export const ChooseGame = () => {
  const { startGame } = useContext(GameContext)
  return (
    <>
      <h3>Choose Game</h3>
      <GameModeBlock title="Play Online" subtitle="Random Matchmaking" handleClick={() => {
        console.log("clicked play online")
      }} />
      <GameModeBlock title="Play Hotseat" subtitle="Play on your computer" handleClick={() => {
        console.log("clicked play hotseat")
        startGame("hotseat")
      }} />
    </>
  )
}

export const Panel = () => {
  return (
    <div id="play-panel" className="base-layer" >
      <Outlet />
    </div>
  )
}
