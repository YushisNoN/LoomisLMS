
import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface User {
    id: string
    email: string
    name: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
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

const API_URL = 'http://localhost:8080/api/auth'

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    async function getCurrentUser(token: string): Promise<User> {
        const response = await fetch(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Не удалось получить пользователя')
        }

        const data = await response.json()

        return {
            id: data.id,
            email: data.email,
            name: `${data.firstName} ${data.lastName}`,
        }
    }

    async function refreshAccessToken(): Promise<string> {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
            throw new Error('Refresh token отсутствует')
        }

        const response = await fetch(`${API_URL}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        })

        if (!response.ok) {
            throw new Error('Не удалось обновить токен')
        }

        const data = await response.json()

        localStorage.setItem('token', data.token)
        localStorage.setItem('refreshToken', data.refreshToken)

        return data.token
    }

    async function restoreAuth() {
        const token = localStorage.getItem('token')

        if (!token) {
            setIsLoading(false)
            return
        }

        try {
            let currentUser: User

            try {
                currentUser = await getCurrentUser(token)
            } catch {
                const newToken = await refreshAccessToken()
                currentUser = await getCurrentUser(newToken)
            }

            setUser(currentUser)
        } catch (error) {
            console.error('[AUTH] Ошибка восстановления:', error)

            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        restoreAuth()
    }, [])

    async function register(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) {
        const response = await fetch(`${API_URL}/register`, {
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
        localStorage.setItem('refreshToken', data.refreshToken)

        const currentUser = await getCurrentUser(data.token)
        setUser(currentUser)
    }

    async function login(email: string, password: string) {
        const response = await fetch(`${API_URL}/login`, {
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
        localStorage.setItem('refreshToken', data.refreshToken)

        const currentUser = await getCurrentUser(data.token)
        setUser(currentUser)
    }

    async function logout() {
        const refreshToken = localStorage.getItem('refreshToken')

        try {
            if (refreshToken) {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                })
            }
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            setUser(null)
        }
    }

    const value: AuthContextType = {
        user,
        isAuthenticated: user !== null,
        isLoading,
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
