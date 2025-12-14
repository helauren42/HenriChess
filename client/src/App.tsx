import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from "react-toastify"
import './App.css'
import { HomePage } from './Pages/HomePage'
import { AuthPage, LoginPage, SignupPage } from './Pages/AuthPage'
import { useEffect } from 'react'
import { readFetch } from './utils/requests'

function App() {
  const initUser = async () => {
    if (!await readFetch("/auth/device-token"))
      return
    const resp = await readFetch("/auth/login")
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
