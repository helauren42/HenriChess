import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './Providers/User'
import { AuthCompProvider } from './Providers/AuthComp.tsx'
import { GameProvider } from './Providers/Game.tsx'
import { GameWatchProvider } from './Providers/ActiveOnlineGames.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <UserProvider>
      <AuthCompProvider>
        <GameProvider>
          <GameWatchProvider>
            <App />
          </GameWatchProvider>
        </GameProvider>
      </AuthCompProvider>
    </UserProvider>
  </BrowserRouter>
)
