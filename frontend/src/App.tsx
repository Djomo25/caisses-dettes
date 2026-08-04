import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { ToastProvider } from './toast/ToastProvider'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AppShell } from './layouts/AppShell'
import { Connexion } from './pages/Connexion'
import { Accueil } from './pages/Accueil'
import { Caisse } from './pages/Caisse'
import { Dettes } from './pages/Dettes'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/connexion" element={<Connexion />} />
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
