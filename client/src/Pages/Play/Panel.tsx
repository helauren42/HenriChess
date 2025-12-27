import "./Panel.css"

interface GameModeBlockFace {
  title: string
  subtitle: string
  // handleClick: () => void
}

const GameModeBlock = ({ title, subtitle }: GameModeBlockFace) => {
  return (
    <div className="game-mode-block">
      <h3>{title}</h3>
      <h5>{subtitle}</h5>
    </div>
  )
}

export const Panel = () => {
  return (
    <div id="play-panel" className="base-layer" >
      <h2>Choose Game</h2>
      <GameModeBlock title="Play Online" subtitle="Random Matchmaking" />
      <GameModeBlock title="Play Hotseat" subtitle="Play on your computer" />
    </div>
  )
}
