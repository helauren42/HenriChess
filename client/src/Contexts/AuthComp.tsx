import { createContext, type Dispatch, type SetStateAction } from "react"

export interface AuthCompFaceFace {
  section: "login" | "signup" | "validate" | "unauthorized"
  on: boolean
}

export interface AuthCompFace {
  authComp: AuthCompFaceFace,
  setAuthComp: Dispatch<SetStateAction<AuthCompFaceFace>>
  openAuth: (section: "login" | "signup" | "validate" | "unauthorized") => void
  closeAuth: () => void
}

export const AuthCompContext = createContext<AuthCompFace>({
  authComp: {
    section: "login",
    on: false
  },
  setAuthComp: () => {
    console.error("AuthCompContext used outside of context")
  },
  openAuth: () => {
    console.error("AuthCompContext used outside of context")
  },
  closeAuth: () => {
    console.error("AuthCompContext used outside of context")
  },
})
