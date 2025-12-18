import { Game } from "./Game"
import { Panel } from "./Panel"

export const PlayPage = () => {
  return (
    <div className="w-full h-full flex items-center justify-evenly">
      <Game />
      <Panel />
    </div>
  )
}
