import { PassiveBoard } from "./Board"
import { ChooseGame } from "./Panel"

export const PlayPage = () => {
  return (
    <div className="w-full h-full flex items-center justify-evenly">
      <PassiveBoard />
      <div id="play-page" className="play-panel">
        <h3>Choose Mode</h3>
        <ChooseGame />
      </div>
    </div>
  )
}
