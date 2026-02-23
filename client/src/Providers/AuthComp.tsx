import { useState, type ReactNode } from "react"
import { AuthCompContext, type AuthCompFaceFace } from "../Contexts/AuthComp"

export const AuthCompProvider = ({ children }:
  { children: ReactNode }) => {
  const [authComp, setAuthComp] = useState<AuthCompFaceFace>({
    section: "login",
    on: false
  })
  const openAuth = (section: "login" | "signup" | "validate" | "requestResetPassword" | "resetPassword" | "unauthorized") => {
    setAuthComp({
      section: section,
      on: true
    })
  }
  const closeAuth = () => {
    console.log("Called closeAuth")
    setAuthComp({
      section: authComp.section,
      on: false
    })
  }
  return (
    <AuthCompContext.Provider value={{ authComp, setAuthComp, openAuth, closeAuth }} >
      {children}
    </AuthCompContext.Provider>
  )
}
