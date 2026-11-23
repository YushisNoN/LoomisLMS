import {createContext, useContext, useState,} from 'react'

import type { ReactNode } from 'react'

interface User {
    id: string
    email: string
    name: string
}

// Что будет доступно через контекст
interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    login: (email: string, password: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)

    function login(email: string, password: string) {
        // Заглушка для backend
        if (!email || !password) {
            throw new Error('Email и пароль обязательны')
        }

        setUser({
            id: crypto.randomUUID(),
            email,
            name: email.split('@')[0],
        })
    }

    function logout() {
        setUser(null)
    }

    const value: AuthContextType = {
        user,
        isAuthenticated: user !== null,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error(
            'useAuth должен использоваться внутри AuthProvider'
        )
    }

    return context
}
