import { PassiveBoard } from "./Board"
import { ChooseGame, Panel } from "./Panel"

export const PlayPage = () => {
  return (
    <div className="w-full h-full flex items-center justify-evenly">
      <PassiveBoard />
      <Panel>
        <ChooseGame />
      </Panel>
    </div>
  )
}
