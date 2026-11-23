import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage.tsx';
import RegisterPage from '../pages/auth/RegisterPage';
import {AuthProvider} from "../context/AuthContext.tsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route element={<ProtectedRoute/>}>
                        <Route path={"/dashboard"} element={<DashboardPage/>}/>
                    </Route>
                    <Route path="*" element={<Navigate to="/login" replace/>}/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App