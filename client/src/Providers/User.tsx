import { useEffect, useState, type ReactNode } from "react"
import { UserContext, type UserData } from "../Contexts/User"


export const UserProvider = ({ children }:
  { children: ReactNode }) => {
  const [user, setUser] = useState<UserData>({
    username: "",
    email: ""
  })
  useEffect(() => {
    console.log("!!! user: ", user)
  }, [user])
  return (
    <UserContext.Provider value={{ user, setUser }}> {children}
    </UserContext.Provider>
  )
}
