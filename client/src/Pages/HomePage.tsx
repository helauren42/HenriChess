import { Outlet } from "react-router-dom"
import { Navbar } from "../componants/Navbar/Navbar"
import { AuthPage } from "../componants/AuthComp"

export const HomePage = () => {
  return (
    <div className="relative w-full h-full flex">
      <Navbar />
      {<Outlet />}
      <AuthPage />
    </div>
  )
}
