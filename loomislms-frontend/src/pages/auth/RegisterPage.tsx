import { Link } from 'react-router-dom'
import { useState } from 'react'

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';


function RegisterPage() {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        setErrors(prev => ({
            ...prev,
            [name]: '',
        }));
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!validateForm()) {
            return
        }

        console.log('Form data:', formData)
    }

    function validateForm() {
        const newErrors: Record<string, string> = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Введите имя'
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Введите фамилию'
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Введите корректный email'
        }

        if (formData.password.length < 8) {
            newErrors.password = 'Пароль должен содержать минимум 8 символов'
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают'
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    return (
        <div className="
            flex
            min-h-screen
            items-center
            justify-center
            bg-app
            px-4
            py-10
        ">
            <div className="w-full max-w-md">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">
                        Loomis<span className="text-primary">LMS</span>
                    </h1>

                    <p className="mt-2 text-sm text-text-secondary">
                        Learning Management System
                    </p>
                </div>

                <div className="
                    rounded-2xl
                    border
                    border-border
                    bg-surface
                    p-8
                ">
                    <h2 className="text-2xl font-semibold">
                        Создание аккаунта
                    </h2>

                    <p className="mt-2 text-sm text-text-secondary">
                        Заполните данные для регистрации
                    </p>

                    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
                        <Input
                            label="Имя"
                            name="firstName"
                            type="text"
                            placeholder="Ваше имя"
                            value={formData.firstName}
                            onChange={handleChange}
                            error={errors.firstName}
                            required
                        />

                        <Input
                            label="Фамилия"
                            name="lastName"
                            type="text"
                            placeholder="Ваша фамилия"
                            value={formData.lastName}
                            onChange={handleChange}
                            error={errors.lastName}
                            required
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="example@mail.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Пароль"
                            name="password"
                            type="password"
                            placeholder="Придумайте пароль"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            required
                        />

                        <Input
                            label="Подтверждение пароля"
                            name="confirmPassword"
                            type="password"
                            placeholder="Повторите пароль"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            required
                        />

                        <Button type="submit" className="w-full">
                            Зарегистрироваться
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
                            Уже есть аккаунт?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-primary hover:text-primary-hover"
                            >
                                Войти
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default RegisterPage