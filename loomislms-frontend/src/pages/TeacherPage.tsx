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

interface Course {
    id: string
    title: string
    description: string | null
    createdAt: string
    published: boolean
}

function TeacherPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoadingCourses, setIsLoadingCourses] = useState(true)

    const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null)
    const [courseActionError, setCourseActionError] = useState('')
    const [courseActionSuccess, setCourseActionSuccess] = useState('')

    async function loadCourses() {
        try {
            const token = localStorage.getItem('token')

            const response = await fetch('http://localhost:8080/api/courses/my', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error('Не удалось загрузить курсы')
            }

            const data: Course[] = await response.json()
            setCourses(data)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ошибка загрузки курсов'
            )
        } finally {
            setIsLoadingCourses(false)
        }
    }

    useEffect(() => {
        loadCourses()
    }, [])

    async function handleCreateCourse(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        setError('')
        setSuccess('')
        setIsCreating(true)

        try {
            const token = localStorage.getItem('token')

            const response = await fetch('http://localhost:8080/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                }),
            })

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message || 'Не удалось создать курс')
            }

            setTitle('')
            setDescription('')
            setSuccess('Курс успешно создан!')

            await loadCourses()

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Произошла ошибка при создании курса'
            )
        } finally {
            setIsCreating(false)
        }
    }

    async function handleTogglePublish(course: Course) {
        setCourseActionError('')
        setCourseActionSuccess('')
        setUpdatingCourseId(course.id)

        try {
            const token = localStorage.getItem('token')

            const action = course.published ? 'unpublish' : 'publish'

            const response = await fetch(
                `http://localhost:8080/api/courses/${course.id}/${action}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message || 'Не удалось изменить статус курса')
            }

            setCourses(prev =>
                prev.map(item =>
                    item.id === course.id
                        ? { ...item, published: !course.published }
                        : item
                )
            )

            setCourseActionSuccess(
                course.published
                    ? 'Курс снят с публикации'
                    : 'Курс успешно опубликован!'
            )
        } catch (err) {
            setCourseActionError(
                err instanceof Error
                    ? err.message
                    : 'Ошибка изменения статуса курса'
            )
        } finally {
            setUpdatingCourseId(null)
        }
    }

    const totalCourses = courses.length
    const publishedCourses = courses.filter(course => course.published).length
    const draftCourses = totalCourses - publishedCourses

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
                                Teacher workspace
                            </p>
                        </div>
                    </div>

                    <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Рабочая область
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
                            <span>♙</span>
                            Ученики
                        </div>
                    </nav>

                    <div className="mt-auto border-t border-white/10 pt-6">
                        <p className="px-3 text-xs text-gray-500">
                            LoomisLMS · Teacher
                        </p>
                    </div>
                </aside>

                {/* Main content */}
                <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
                    <div className="mx-auto max-w-7xl">

                        {/* Header */}
                        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="mb-2 text-sm text-gray-500">
                                    Главная / Панель преподавателя
                                </p>

                                <h2 className="text-2xl font-bold sm:text-3xl">
                                    Добро пожаловать, {user?.name?.split(' ')[0]}!
                                </h2>

                                <p className="mt-2 text-sm text-gray-400">
                                    Управляй своими курсами и учебными материалами.
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden text-right sm:block">
                                    <p className="text-sm font-medium">
                                        {user?.name}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Преподаватель
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/20 font-semibold text-violet-300">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    На главную
                                </Button>
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
                                    TEACHER WORKSPACE
                                </span>

                                <h3 className="text-2xl font-bold sm:text-3xl">
                                    Создавай курсы.
                                    <br />
                                    Делись знаниями.
                                </h3>

                                <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">
                                    Создавай учебные программы, добавляй
                                    модули и уроки, проверяй задания
                                    и следи за прогрессом учеников.
                                </p>
                            </div>
                        </section>

                        {/* Statistics */}
                        <section className="mb-10">
                            <div className="mb-5">
                                <h3 className="text-lg font-semibold">
                                    Моя статистика
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Общая информация о твоей работе
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <StatCard
                                    icon="◷"
                                    label="Черновики"
                                    value={String(draftCourses)}
                                    description="Не опубликованы"
                                />

                                <StatCard
                                    icon="✓"
                                    label="Опубликовано"
                                    value={String(publishedCourses)}
                                    description="Доступны ученикам"
                                />

                                <StatCard
                                    icon="♙"
                                    label="Ученики"
                                    value="0"
                                    description="Записаны на курсы"
                                />

                                <StatCard
                                    icon="♙"
                                    label="Ученики"
                                    value="0"
                                    description="Записаны на курсы"
                                />
                            </div>
                        </section>

                        {/* Create course */}
                        <section className="mb-8 rounded-2xl border border-white/10 bg-[#12121d] p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold">
                                    Создать курс
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Начни с названия и краткого описания учебной программы
                                </p>
                            </div>

                            <form onSubmit={handleCreateCourse} className="max-w-2xl space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Название курса
                                    </label>

                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Например, Основы программирования на Java"
                                        maxLength={150}
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Описание курса
                                    </label>

                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Расскажи, чему научатся ученики..."
                                        maxLength={1000}
                                        rows={4}
                                        className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-400">
                                        {error}
                                    </p>
                                )}

                                {success && (
                                    <p className="text-sm text-green-400">
                                        {success}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isCreating || !title.trim()}
                                >
                                    {isCreating ? 'Создание...' : 'Создать курс'}
                                </Button>
                            </form>
                        </section>

                        {/* Courses */}
                        <section className="rounded-2xl border border-white/10 bg-[#12121d] p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold">
                                    Мои курсы
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Управление учебными программами
                                </p>
                            </div>
                            {courseActionError && (
                                <p className="mb-4 text-sm text-red-400">
                                    {courseActionError}
                                </p>
                            )}

                            {courseActionSuccess && (
                                <p className="mb-4 text-sm text-green-400">
                                    {courseActionSuccess}
                                </p>
                            )}

                            {isLoadingCourses ? (
                                <div className="py-12 text-center text-sm text-gray-500">
                                    Загрузка курсов...
                                </div>
                            ) : courses.length === 0 ? (
                                <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl text-violet-300">
                                        ▤
                                    </div>

                                    <h4 className="font-medium">
                                        У тебя пока нет курсов
                                    </h4>

                                    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                        Создай первый курс, чтобы начать наполнять его
                                        модулями и уроками.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {courses.map((course) => (
                                        <div
                                            key={course.id}
                                            onClick={() => navigate(`/teacher/courses/${course.id}`)}
                                            className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-violet-500/30 hover:bg-white/[0.04]"
                                        >
                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-300">
                                                    ▤
                                                </div>

                                                <span
                                                    className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs leading-none ${
                                                        course.published
                                                            ? 'border-green-500/20 bg-green-500/10 text-green-400'
                                                            : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                                                    }`}
                                                >
                                                    {course.published ? 'Опубликован' : 'Черновик'}
                                                </span>
                                            </div>

                                            <h4 className="font-semibold">
                                                {course.title}
                                            </h4>

                                            <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                                                {course.description || 'Описание отсутствует'}
                                            </p>

                                            <div className="mt-5 border-t border-white/10 pt-4 text-xs text-gray-600">
                                                Создан: {new Date(course.createdAt).toLocaleDateString('ru-RU')}
                                            </div>
                                            <div
                                                className="mt-4"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button
                                                    variant="secondary"
                                                    disabled={updatingCourseId === course.id}
                                                    onClick={() => handleTogglePublish(course)}
                                                >
                                                    {updatingCourseId === course.id
                                                        ? 'Обновление...'
                                                        : course.published
                                                            ? 'Снять с публикации'
                                                            : 'Опубликовать'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-600">
                            © 2026 LoomisLMS · Teacher Workspace
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

export default TeacherPage