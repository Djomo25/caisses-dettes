import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { ToastProvider } from './toast/ToastProvider'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { GuestRoute } from './routes/GuestRoute'
import { AppShell } from './layouts/AppShell'
import { Inscription } from './pages/auth/Inscription'
import { Connexion } from './pages/auth/Connexion'
import { Verification } from './pages/auth/Verification'
import { Accueil } from './pages/Accueil'
import { Caisse } from './pages/Caisse'
import { Dettes } from './pages/Dettes'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/inscription" element={<Inscription />} />
              <Route path="/connexion" element={<Connexion />} />
              <Route path="/verification" element={<Verification />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<Accueil />} />
                <Route path="/caisse" element={<Caisse />} />
                <Route path="/dettes" element={<Dettes />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
