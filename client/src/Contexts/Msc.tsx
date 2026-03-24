import { createContext, type Dispatch, type SetStateAction } from "react"

export interface MscFace {
  challenger: string
  setChallenger: Dispatch<SetStateAction<string>>
}

export const MscContext = createContext({
  challenger: "",
  setChallenger: (challenger) => {
    console.error("MscContext used outside of context")
  },
})
