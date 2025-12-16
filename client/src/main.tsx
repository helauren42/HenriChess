import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './Providers/User'
import { AuthCompProvider } from './Providers/AuthComp.tsx'

createRoot(document.getElementById('root')!).render(
  <UserProvider>
    <AuthCompProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthCompProvider>
  </UserProvider>
)
