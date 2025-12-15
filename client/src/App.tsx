import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from "react-toastify"
import './App.css'
import { HomePage } from './Pages/HomePage'
import { AuthPage, LoginPage, SignupPage } from './Pages/AuthPage'
import { useContext, useEffect } from 'react'
import { readFetch, type MyResp } from './utils/requests'
import { UserContext, type UserContextFace } from './Contexts/User'
import { UserPage } from './Pages/UserPage'
import { ToastSessionExpired } from './utils/toastify'

function App() {
  const { setUser } = useContext<UserContextFace>(UserContext)
  const initUser = async () => {
    const storeUsername = localStorage.getItem("username")
    const storeEmail = localStorage.getItem("email")
    if (storeUsername && storeEmail) {
      setUser({
        username: storeUsername,
        email: storeEmail
      })
    }
    const resp: MyResp = await readFetch("/auth/login")
    if (resp.ok) {
      setUser({
        username: resp.data["username"],
        email: resp.data["email"],
      })
      localStorage.setItem("username", resp.data["username"])
      localStorage.setItem("email", resp.data["email"])
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
    initUser()
  }, [])
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/user/*' element={<UserPage />} />
        <Route path='/auth/' element={<AuthPage />}>
          <Route path='/auth/login' element={<LoginPage />} />
          <Route path='/auth/signup' element={<SignupPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
