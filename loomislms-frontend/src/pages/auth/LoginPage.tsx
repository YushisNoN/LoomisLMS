import { Link } from 'react-router-dom'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.tsx";
import {useState} from "react";
import type {FormEvent} from "react";

function LoginPage() {

    const { login, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        try {
            login(email, password)
            navigate('/dashboard')
        } catch {
            setError('Не удалось выполнить вход')
        }
    }

    return (
        <div className="
            flex
            min-h-screen
            items-center
            justify-center
            bg-app
            px-4
        ">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">
                        Loomis<span className="text-primary">LMS</span>
                    </h1>
                    <p className="mt-2 text-sm text-text-secondary">
                        Learning Management System
                    </p>
                </div>

                {/* Form */}
                <div className="
                    rounded-2xl
                    border
                    border-border
                    bg-surface
                    p-8
                ">
                    <h2 className="text-2xl font-semibold">
                        С возвращением!
                    </h2>

                    <p className="mt-2 text-sm text-text-secondary">
                        Войдите в свой аккаунт
                    </p>

                    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="example@mail.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />

                        <Input
                            label="Пароль"
                            name="password"
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:text-primary-hover"
                            >
                                Забыли пароль?
                            </Link>
                        </div>
                        {error && (
                            <p className="text-sm text-danger">
                                {error}
                            </p>
                        )}
                        <Button type="submit" className="w-full">
                            Войти
                        </Button>

                    </form>

                    <div className="
                        mt-6
                        border-t
                        border-border
                        pt-6
                        text-center
                    ">
                        <p className="text-sm text-text-secondary">
                            Нет аккаунта?{' '}
                            <Link
                                to="/register"
                                className="font-medium text-primary hover:text-primary-hover"
                            >
                                Зарегистрироваться
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default LoginPage