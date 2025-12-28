import { useContext } from "react"
import "./Panel.css"
import { GameContext } from "../../Contexts/Game"

interface GameModeBlockFace {
  title: string
  subtitle: string
  handleClick: () => void
}

const GameModeBlock = ({ title, subtitle, handleClick }: GameModeBlockFace) => {
  return (
    <div className="game-mode-block" onClick={handleClick}>
      <h3>{title}</h3>
      <h5>{subtitle}</h5>
    </div>
  )
}

export const Panel = () => {
  const { startGame } = useContext(GameContext)
  return (
    <div id="play-panel" className="base-layer" >
      <h2>Choose Game</h2>
      <GameModeBlock title="Play Online" subtitle="Random Matchmaking" handleClick={() => {
        console.log("clicked play online")
      }} />
      <GameModeBlock title="Play Hotseat" subtitle="Play on your computer" handleClick={() => {
        console.log("clicked play hotseat")
        startGame("hotseat")
      }} />
    </div>
  )
}
