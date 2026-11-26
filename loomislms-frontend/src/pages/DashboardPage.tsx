import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

interface Course {
    id: string
    title: string
    description: string | null
    createdAt: string
}

function DashboardPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadCourses() {
            try {
                const token = localStorage.getItem('token')

                const response = await fetch('http://localhost:8080/api/courses', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error('Не удалось загрузить курсы')
                }

                const data: Course[] = await response.json()
                setCourses(data)
            } catch (error) {
                console.error('[COURSES] Ошибка загрузки:', error)
                setError('Не удалось загрузить курсы')
            } finally {
                setIsLoading(false)
            }
        }

        loadCourses()
    }, [])

    return (
        <div className="min-h-screen bg-[#0b0b12] text-white">
            <div className="flex min-h-screen">

                {/* Sidebar */}
                <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#101019] p-6 lg:flex lg:flex-col">
                    <div className="mb-12 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold shadow-lg shadow-violet-600/20">
                            L
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-wide">
                                Loomis<span className="text-violet-400">LMS</span>
                            </h1>
                            <p className="text-xs text-gray-500">
                                Learning platform
                            </p>
                        </div>
                    </div>

                    <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Меню
                    </p>

                    <nav className="space-y-2">
                        <div className="flex items-center gap-3 rounded-xl bg-violet-600/15 px-4 py-3 text-sm font-medium text-violet-300">
                            <span>▦</span>
                            Обзор
                        </div>

                        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white">
                            <span>▤</span>
                            Мои курсы
                        </div>

                        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white">
                            <span>✓</span>
                            Задания
                        </div>

                        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white">
                            <span>▧</span>
                            Расписание
                        </div>
                    </nav>
                </aside>

                {/* Main content */}
                <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
                    <div className="mx-auto max-w-7xl">

                        {/* Header */}
                        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="mb-2 text-sm text-gray-500">
                                    Главная / Обзор
                                </p>

                                <h2 className="text-2xl font-bold sm:text-3xl">
                                    Добро пожаловать, {user?.name?.split(' ')[0]}!
                                </h2>

                                <p className="mt-2 text-sm text-gray-400">
                                    Продолжим твой путь к новым знаниям?
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden text-right sm:block">
                                    <p className="text-sm font-medium">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/20 font-semibold text-violet-300">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                {user?.role === 'TEACHER' && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => navigate('/teacher')}
                                    >
                                        Панель преподавателя
                                    </Button>
                                )}
                                <Button
                                    variant="secondary"
                                    onClick={logout}
                                >
                                    Выйти
                                </Button>
                            </div>
                        </header>

                        {/* Welcome banner */}
                        <section className="relative mb-8 overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-r from-violet-700/30 via-indigo-700/20 to-[#171326] p-7 sm:p-10">
                            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

                            <div className="relative max-w-xl">
                                <span className="mb-4 inline-block rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs font-medium text-violet-200">
                                    YOUR LEARNING SPACE
                                </span>

                                <h3 className="text-2xl font-bold sm:text-3xl">
                                    Учись в своём темпе.
                                    <br />
                                    Достигай большего.
                                </h3>

                                <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">
                                    Здесь будет отображаться твой учебный
                                    прогресс, доступные курсы и новые задания.
                                </p>
                            </div>
                        </section>

                        {/* Statistics */}
                        <section className="mb-10">
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Моя статистика
                                </h3>
                                <span className="text-xs text-gray-500">
                                    Текущий прогресс
                                </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <StatCard
                                    icon="▤"
                                    label="Мои курсы"
                                    value={String(courses.length)}
                                    description="Доступные курсы"
                                />

                                <StatCard
                                    icon="✓"
                                    label="Активные задания"
                                    value="0"
                                    description="Нет активных заданий"
                                />

                                <StatCard
                                    icon="★"
                                    label="Завершённые курсы"
                                    value="0"
                                    description="Здесь появятся достижения"
                                />
                            </div>
                        </section>

                        {/* Learning sections */}
                        <div className="grid gap-6 xl:grid-cols-3">

                            {/* Courses */}
                            <section className="rounded-2xl border border-white/10 bg-[#12121d] p-6 xl:col-span-2">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Продолжить обучение
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Твои текущие курсы
                                        </p>
                                    </div>

                                    <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-gray-400">
                                        {courses.length} курсов
                                    </span>
                                </div>

                                {isLoading ? (
                                    <div className="flex min-h-56 items-center justify-center text-sm text-gray-500">
                                        Загружаем курсы...
                                    </div>
                                ) : error ? (
                                    <div className="flex min-h-56 items-center justify-center text-sm text-red-400">
                                        {error}
                                    </div>
                                ) : courses.length === 0 ? (
                                    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-300">
                                            ▤
                                        </div>

                                        <h4 className="font-medium">
                                            Пока нет курсов
                                        </h4>

                                        <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                            Когда тебе будут доступны курсы,
                                            они появятся в этом разделе.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {courses.map((course) => (
                                            <div
                                                key={course.id}
                                                onClick={() => navigate(`/courses/${course.id}`)}
                                                className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-violet-500/40 hover:bg-violet-500/[0.04]"
                                            >`
                                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-300">
                                                    ▤
                                                </div>

                                                <h4 className="font-semibold">
                                                    {course.title}
                                                </h4>

                                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                                    {course.description || 'Описание пока отсутствует'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Tasks */}
                            <section className="rounded-2xl border border-white/10 bg-[#12121d] p-6">
                                <h3 className="text-lg font-semibold">
                                    Ближайшие задания
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Твои учебные задачи
                                </p>

                                <div className="flex min-h-56 flex-col items-center justify-center text-center">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl text-indigo-300">
                                        ✓
                                    </div>

                                    <h4 className="font-medium">
                                        Всё спокойно
                                    </h4>

                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        Новые задания появятся здесь.
                                    </p>
                                </div>
                            </section>
                        </div>

                        <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-600">
                            © 2026 LoomisLMS · Learning Management System
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    )
}

interface StatCardProps {
    icon: string
    label: string
    value: string
    description: string
}

function StatCard({ icon, label, value, description }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#12121d] p-5 transition hover:border-violet-500/30">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                    {label}
                </p>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-lg text-violet-300">
                    {icon}
                </div>
            </div>

            <p className="text-3xl font-bold">
                {value}
            </p>

            <p className="mt-2 text-xs text-gray-500">
                {description}
            </p>
        </div>
    )
}

export default DashboardPage