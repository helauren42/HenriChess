import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from "react-toastify"
import { RootPage } from './Pages/RootPage'
import { useContext, useEffect } from 'react'
import { readFetch, type MyResp } from './utils/requests'
import { UserContext, type UserContextFace, type UserResp } from './Contexts/User'
import { UserPage } from './Pages/UserPage'
import { ToastSessionExpired } from './utils/toastify'
import { PlayPage } from './Pages/Play/PlayPage'
import { HotseatGame } from './Pages/Play/HotseatGame'
import { OnlineGame } from './Pages/Play/OnlineGame'
import { MatchmakeOnline } from './Pages/Play/MatchmakeOnline'
import { GameExpired } from './componants/GameExpired'
import { SocialPage } from './Pages/SocialPage'
import { HomePage } from './Pages/HomePage'
import { VerifyEmail } from './Pages/EmailConfirmation'

import './App.css'

function App() {
  const { setUser } = useContext<UserContextFace>(UserContext)
  const initUser = async () => {
    const storeUsername = localStorage.getItem("username")
    const storeEmail = localStorage.getItem("email")
    if (storeUsername && storeEmail && storeUsername != "") {
      setUser({
        username: storeUsername,
        email: storeEmail
      })
    }
    const resp: MyResp = await readFetch("/auth/login")
    if (resp.ok) {
      const data = resp.data as UserResp
      setUser({
        username: data["username"],
        email: data["email"],
      })
      localStorage.setItem("username", data["username"])
      localStorage.setItem("email", data["email"])
    }
    else {
      if (localStorage.getItem("username"))
        ToastSessionExpired()
      setUser({
        username: "",
        email: "",
      })
      localStorage.removeItem("username")
      localStorage.removeItem("email")
    }
  }
  useEffect(() => {
    document.title = "Henri Chess"
    initUser()
  }, [])
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<RootPage />}>
          <Route path='/home/' element={<HomePage />} />
          <Route path='/game/' element={<PlayPage />} />
          <Route path='/game/hotseat/*' element={<HotseatGame />} />
          <Route path='/game/online/*' element={<OnlineGame />} />
          <Route path='/game/matchmake-online' element={<MatchmakeOnline />} />
          <Route path='/user/*' element={<UserPage />} />
          <Route path='/social' element={<SocialPage />} />
          <Route path='/verify-email/*' element={<VerifyEmail />} />
        </Route>
      </Routes>
      <GameExpired />
    </>
  )
}

export default App
