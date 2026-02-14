import { useNavigate } from "react-router-dom"
import "./Navbar.css"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Contexts/User"
import { AuthCompContext } from "../../Contexts/AuthComp"
import { SvgAccount } from "../../svgs/svgs.tsx"

interface NavlinkProps {
  name: string,
  to: string,
  imgsrc: string
}

const Navlink = ({ name, to, imgsrc }: NavlinkProps) => {
  const nav = useNavigate()
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    console.log("nav link useEffect")
    const handleResize = () => {
      console.log("nav link handleResize")
      setWidth(window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
  }, [])
  return (
    <li onClick={() => nav(to)} className="flex flex-row pt-3 gap-2 align-text-bottom">
      <div className="w-10 max-w-10 flex flex-col justify-center">
        <img className="min-w-8" src={imgsrc} />
      </div>
      {
        width > 1200 ?
          <h4 className="h-full w-full flex flex-col justify-end">{name}</h4>
          : null
      }
    </li>
  )
}


const NavAuthBtn = () => {
  const [width, setWidth] = useState(window.innerWidth)
  const { openAuth } = useContext(AuthCompContext)
  const { user } = useContext(UserContext)
  const nav = useNavigate()
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
  }, [])
  const navAccount = () => {
    nav(`/user/${user.username}`)
  }
  return (
    <>
      {
        width > 1200 ? (
          <>
            <button className="flex justify-center items-center w-full max-h-15" onClick={user.username ? navAccount : () => openAuth("login")}>
              < SvgAccount className="fill-(--text-color-light) w-12" />
            </button>
          </>
        )
          :
          <span className="cursor-pointer" onClick={user.username ? navAccount : () => openAuth("login")}>
            <SvgAccount className="fill-(--text-color-dark) min-w-13" />
          </span>
      }
    </>
  )
}


export const Navbar = () => {
  const nav = useNavigate()
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
  }, [])
  return (
    <nav>
      <div onClick={() => nav("/")} className="cursor-pointer">
        {
          width > 1200 ?
            <>
              <h3 className="text-center">Henri</h3>
              <h3 className="text-center">Chess</h3>
            </>
            :
            <h3 className="text-center">HC</h3>
        }
      </div>
      <ul className="flex flex-col gap-5">
        <Navlink name="Play" to="/game" imgsrc="/images/nav/pawn.svg" />
        <Navlink name="Watch" to="/watch" imgsrc="/images/nav/eyes.svg" />
        <Navlink name="Social" to="/social" imgsrc="/images/nav/people.svg" />
      </ul>
      {
        <div id="centerer" className="flex justify-center">
          <NavAuthBtn />
        </div>
      }
    </nav >
  )
}
