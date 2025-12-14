import { useState, type ReactNode } from "react"
import { UserContext, type UserData } from "../Contexts/User"


export const UserProvider = ({ children }:
  { children: ReactNode }) => {
  const [user, setUser] = useState<UserData>({
    username: "",
    email: ""
  })
  return (
    <UserContext.Provider value={{ user, setUser }}> {children}
    </UserContext.Provider>
  )
}
