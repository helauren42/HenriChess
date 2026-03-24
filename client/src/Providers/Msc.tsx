import { useState, type ReactNode } from "react"
import { MscContext } from "../Contexts/Msc"

export const MscProvider = ({ children }: { children: ReactNode }) => {
  const [challenger, setChallenger] = useState("")
  return (
    <MscContext.Provider value={{ challenger, setChallenger }}>
      {children}
    </MscContext.Provider>
  )

}
