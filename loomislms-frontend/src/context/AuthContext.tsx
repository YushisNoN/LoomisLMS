import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface User {
    id: string
    email: string
    name: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    register: (
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) => Promise<void>
}


const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)

    async function register(firstName: string, lastName: string, email: string, password: string) {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                password,
            }),
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка регистрации')
        }

        localStorage.setItem('token', data.token)

        setUser({
            id: '',
            email,
            name: `${firstName} ${lastName}`,
        })
    }

    async function login(email: string, password: string) {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Неверный email или пароль')
        }

        localStorage.setItem('token', data.token)

        // Пока используем email как имя пользователя.
        setUser({
            id: '',
            email,
            name: email.split('@')[0],
        })
    }

    function logout() {
        localStorage.removeItem('token')
        setUser(null)
    }

    const value: AuthContextType = {
        user,
        isAuthenticated: user !== null,
        login,
        register,
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
        throw new Error('useAuth должен использоваться внутри AuthProvider')
    }

    return context
}