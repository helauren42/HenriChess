import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Navbar } from "../componants/Navbar/Navbar"
import { AuthPage } from "../componants/AuthComp"
import "./RootPage.css"
import { useEffect } from "react"

export const RootPage = () => {
  const location = useLocation()
  const nav = useNavigate()
  useEffect(() => {
    if (location.pathname == "/")
      nav("/home")
  }, [location])
  return (
    <div id="root-page">
      <Navbar />
      {<Outlet />}
      <AuthPage />
    </div>
  )
}
