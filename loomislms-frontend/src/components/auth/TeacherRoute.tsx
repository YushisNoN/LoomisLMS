import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function TeacherRoute() {
    const { user, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return null
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (user?.role !== 'TEACHER') {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}

export default TeacherRoute