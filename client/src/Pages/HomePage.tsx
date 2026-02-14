import { Outlet } from "react-router-dom"
import { Navbar } from "../componants/Navbar/Navbar"
import { AuthPage } from "../componants/AuthComp"
import "./HomePage.css"

export const HomePage = () => {
  return (
    <div id="home-page">
      <Navbar />
      {<Outlet />}
      <AuthPage />
    </div>
  )
}
