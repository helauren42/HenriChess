import { useNavigate } from "react-router-dom"
import "./Navbar.css"
import { useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { UserContext } from "../../Contexts/User"
import { AuthCompContext } from "../../Contexts/AuthComp"
import { SvgAccount, SvgAlign } from "../../svgs/svgs.tsx"

interface NavlinkProps {
  name: string,
  to: string,
  imgsrc: string
}

const Navlink = ({ name, to, imgsrc }: NavlinkProps) => {
  const nav = useNavigate()
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handleResize = () => {
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
        width > 1300 ?
          <h4 className="h-full w-full flex flex-col justify-end">{name}</h4>
          : null
      }
    </li>
  )
}


const NavAuthBtn = () => {
  const [width, setWidth] = useState(window.innerWidth)
  const { openAuth, closeAuth, authComp } = useContext(AuthCompContext)
  const { user } = useContext(UserContext)
  const nav = useNavigate()
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
  }, [])
  const navAccount = () => {
    nav(`/user/${user.username}`)
  }
  const handleClick = () => {
    console.log("handleClick")
    if (user.username.length > 0)
      return navAccount()
    if (authComp.on == false)
      openAuth("login")
    else
      closeAuth()
  }
  return (
    <>
      {
        width > 1300 ? (
          <>
            <button className="flex justify-center items-center w-full max-h-15" onClick={handleClick}>
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

const BarToggler = ({ setBarVisible }: { setBarVisible: Dispatch<SetStateAction<boolean>> }) => {
  return (
    <div id="bar-toggler" className="absolute flex flex-col bg-(--nav-color) rounded-br cursor-pointer border-b border-r z-10"
      onClick={() => setBarVisible((prev) => !prev)}>
      <SvgAlign />
    </div>
  )
}

export const Navbar = () => {
  const nav = useNavigate()
  const [width, setWidth] = useState(window.innerWidth)
  const [barVisible, setBarVisible] = useState(false)
  useEffect(() => {
    if (width > 800)
      setBarVisible(true)
    else
      setBarVisible(false)
  }, [width])
  useEffect(() => {
    const barToggler = document.getElementById("bar-toggler")
    const navElem = document.getElementById("nav") as HTMLElement
    console.log("barVisible: ", barVisible)
    if (barVisible) {
      if (barToggler)
        barToggler.style.marginLeft = "80px"
      navElem.style.display = "inline"
    }
    else {
      if (barToggler)
        barToggler.style.marginLeft = ""
      navElem.style.display = "none"
    }
  }, [barVisible])
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
  }, [])
  return (
    <div className="relative">
      <nav id="nav">
        <div onClick={() => nav("/home")} className="cursor-pointer">
          {
            width > 1300 ?
              <>
                <h3 className="text-center">Henri</h3>
                <h3 className="text-center">Chess</h3>
              </>
              :
              <h3 className="text-center">HC</h3>
          }
        </div>
        <ul className="flex flex-col gap-5 mt-10 mb-13">
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
      {
        width <= 800 ?
          <BarToggler setBarVisible={setBarVisible} />
          : null
      }
    </div>
  )
}
