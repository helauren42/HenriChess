import { useNavigate } from "react-router-dom"
import "./Navbar.css"
import { useContext } from "react"
import { UserContext } from "../../Contexts/User"
import { AuthCompContext } from "../../Contexts/AuthComp"

interface NavlinkProps {
  name: string,
  to: string,
  imgsrc: string
}

const Navlink = ({ name, to, imgsrc }: NavlinkProps) => {
  const nav = useNavigate()
  return (
    <li onClick={() => nav(to)} className="flex flex-row pt-3 gap-2 align-text-bottom">
      <div className="w-10 max-w-10 flex flex-col justify-center">
        <img src={imgsrc} />
      </div>
      <h4 className="h-full w-full flex flex-col justify-end">{name}</h4>
    </li>
  )
}

export const Navbar = () => {
  const { user } = useContext(UserContext)
  const { open } = useContext(AuthCompContext)
  const nav = useNavigate()
  return (
    <nav>
      <h3>HenriChess</h3>
      <ul className="flex flex-col gap-5">
        <Navlink name="Play" to="/play" imgsrc="/images/nav/pawn.svg" />
        <Navlink name="Watch" to="/watch" imgsrc="/images/nav/eyes.svg" />
        <Navlink name="Social" to="/social" imgsrc="/images/nav/people.svg" />
      </ul>
      {
        user.username ?
          <button className="mt-4" onClick={() => nav(`/user/${user.username}`)}>Account</button>
          :
          <button className="mt-4" onClick={() => open("login")}>Sign in</button>
      }
    </nav >
  )
}
