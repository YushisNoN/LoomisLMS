import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage.tsx'
import RegisterPage from '../pages/auth/RegisterPage'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import DashboardPage from '../pages/DashboardPage'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App