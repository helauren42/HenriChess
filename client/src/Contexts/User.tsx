import { createContext, type Dispatch, type SetStateAction } from "react"

export interface UserData {
  username: string
  email: string
}

export interface UserContextFace {
  user: UserData
  setUser: Dispatch<SetStateAction<UserData>>
}

export const UserContext = createContext<UserContextFace>({
  user: {
    username: "",
    email: ""
  },
  setUser: () => {
    console.error("UserContext used outside of context")
  }
} as UserContextFace)

