import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import TeacherRoute from '../components/auth/TeacherRoute'

import DashboardPage from '../pages/DashboardPage'
import TeacherPage from '../pages/TeacherPage'
import CoursePage from '../pages/CoursePage'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route element={<TeacherRoute />}>
                        <Route path="/teacher" element={<TeacherPage />} />
                        <Route path="/teacher/courses/:id" element={<CoursePage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App