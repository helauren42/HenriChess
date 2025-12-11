import { Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './Pages/HomePage'
import { AuthPage, LoginPage, SignupPage } from './Pages/AuthPage'

function App() {
  return (
    <>
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
