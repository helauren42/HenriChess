import { useNavigate } from "react-router-dom"
import "./Navbar.css"

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
	const nav = useNavigate()
	return (
		<nav>
			<h3>HenriChess</h3>
			<ul className="flex flex-col gap-5">
				<Navlink name="Play" to="/play" imgsrc="/images/nav/pawn.svg" />
				<Navlink name="Watch" to="/watch" imgsrc="/images/nav/eyes.svg" />
				<Navlink name="Social" to="/social" imgsrc="/images/nav/people.svg" />
			</ul>
			<button className="mt-4" onClick={() => nav("/account")}>Account</button>
		</nav>
	)
}
