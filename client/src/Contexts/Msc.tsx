import { createContext, type Dispatch, type SetStateAction } from "react"

export interface MscFace {
  challenger: string
  setChallenger: Dispatch<SetStateAction<string>>
}

export const MscContext = createContext({
  challenger: "",
  setChallenger: (challenger: string) => {
    console.error("MscContext used outside of context: ", challenger)
  },
})
