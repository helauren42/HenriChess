import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from "react-toastify"
import './App.css'
import { HomePage } from './Pages/HomePage'
import { AuthPage, LoginPage, SignupPage } from './Pages/AuthPage'
import { useContext, useEffect } from 'react'
import { readFetch, type MyResp } from './utils/requests'
import { UserContext, type UserContextFace } from './Contexts/User'

function App() {
  const { user, setUser } = useContext<UserContextFace>(UserContext)
  const initUser = async () => {
    // if ((!(await readFetch("/auth/device-token")).ok))
    //   return
    const resp: MyResp = await readFetch("/auth/login")
    if (resp.ok) {
      // TODO create user context
      setUser({
        username: resp.data["username"],
        email: resp.data["email"],
      })
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
        <Route path='/auth/' element={<AuthPage />}>
          <Route path='/auth/login' element={<LoginPage />} />
          <Route path='/auth/signup' element={<SignupPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
