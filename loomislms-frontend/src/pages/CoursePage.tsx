
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface Course {
    id: string
    title: string
    description: string | null
    createdAt: string
}

type LessonType = 'LECTURE' | 'TEXT' | 'TEST' | 'CODING_TASK'

interface Lesson {
    id: string
    title: string
    content: string | null
    type: LessonType
    position: number
    createdAt: string
}

interface Module {
    id: string
    title: string
    description: string | null
    position: number
    createdAt: string
    lessons: Lesson[]
}

const API_URL = 'http://localhost:8080'

const lessonTypeLabels: Record<LessonType, string> = {
    LECTURE: 'Лекция',
    TEXT: 'Текстовая теория',
    TEST: 'Тест',
    CODING_TASK: 'Задача на программирование'
}

function CoursePage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [course, setCourse] = useState<Course | null>(null)
    const [modules, setModules] = useState<Module[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [expandedModules, setExpandedModules] = useState<string[]>([])

    const [moduleTitle, setModuleTitle] = useState('')
    const [moduleDescription, setModuleDescription] = useState('')
    const [creatingModule, setCreatingModule] = useState(false)

    const [lessonTitles, setLessonTitles] = useState<Record<string, string>>({})
    const [lessonTypes, setLessonTypes] = useState<Record<string, LessonType>>({})
    const [creatingLesson, setCreatingLesson] = useState<string | null>(null)

    const token = localStorage.getItem('token')

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    }

    async function loadCourse() {
        const response = await fetch(`${API_URL}/api/courses/${id}`, {
            headers
        })

        if (!response.ok) {
            throw new Error('Не удалось загрузить курс')
        }

        const data: Course = await response.json()
        setCourse(data)
    }

    async function loadModules() {
        const response = await fetch(
            `${API_URL}/api/courses/${id}/modules`,
            { headers }
        )

        if (!response.ok) {
            throw new Error('Не удалось загрузить модули')
        }

        const data: Omit<Module, 'lessons'>[] = await response.json()

        const modulesWithLessons = await Promise.all(
            data.map(async (module) => {
                const lessonsResponse = await fetch(
                    `${API_URL}/api/courses/${id}/modules/${module.id}/lessons`,
                    { headers }
                )

                if (!lessonsResponse.ok) {
                    throw new Error(`Не удалось загрузить уроки модуля "${module.title}"`)
                }

                const lessons: Lesson[] = await lessonsResponse.json()

                return {
                    ...module,
                    lessons
                }
            })
        )

        setModules(modulesWithLessons)
    }

    async function loadData() {
        try {
            setLoading(true)
            setError('')

            await loadCourse()
            await loadModules()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [id])

    function toggleModule(moduleId: string) {
        setExpandedModules((current) =>
            current.includes(moduleId)
                ? current.filter((item) => item !== moduleId)
                : [...current, moduleId]
        )
    }

    async function createModule(e: React.FormEvent) {
        e.preventDefault()

        if (!moduleTitle.trim()) {
            return
        }

        try {
            setCreatingModule(true)
            setError('')

            const response = await fetch(
                `${API_URL}/api/courses/${id}/modules`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        title: moduleTitle,
                        description: moduleDescription
                    })
                }
            )

            if (!response.ok) {
                throw new Error('Не удалось создать модуль')
            }

            const newModule: Module = {
                ...(await response.json()),
                lessons: []
            }

            setModules((current) => [...current, newModule])
            setExpandedModules((current) => [...current, newModule.id])

            setModuleTitle('')
            setModuleDescription('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка создания модуля')
        } finally {
            setCreatingModule(false)
        }
    }

    async function deleteModule(moduleId: string) {
        if (!window.confirm('Удалить модуль вместе со всеми его уроками?')) {
            return
        }

        try {
            const response = await fetch(
                `${API_URL}/api/courses/${id}/modules/${moduleId}`,
                {
                    method: 'DELETE',
                    headers
                }
            )

            if (!response.ok) {
                throw new Error('Не удалось удалить модуль')
            }

            setModules((current) =>
                current.filter((module) => module.id !== moduleId)
            )

            setExpandedModules((current) =>
                current.filter((item) => item !== moduleId)
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка удаления модуля')
        }
    }

    async function createLesson(moduleId: string, e: React.FormEvent) {
        e.preventDefault()

        const title = lessonTitles[moduleId]?.trim()

        if (!title) {
            return
        }

        try {
            setCreatingLesson(moduleId)
            setError('')

            const response = await fetch(
                `${API_URL}/api/courses/${id}/modules/${moduleId}/lessons`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        title,
                        content: '',
                        type: lessonTypes[moduleId] || 'LECTURE'
                    })
                }
            )

            if (!response.ok) {
                throw new Error('Не удалось создать урок')
            }

            const newLesson: Lesson = await response.json()

            setModules((current) =>
                current.map((module) =>
                    module.id === moduleId
                        ? {
                            ...module,
                            lessons: [...module.lessons, newLesson]
                        }
                        : module
                )
            )

            setLessonTitles((current) => ({
                ...current,
                [moduleId]: ''
            }))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка создания урока')
        } finally {
            setCreatingLesson(null)
        }
    }

    async function deleteLesson(moduleId: string, lessonId: string) {
        if (!window.confirm('Удалить этот урок?')) {
            return
        }

        try {
            const response = await fetch(
                `${API_URL}/api/courses/${id}/modules/${moduleId}/lessons/${lessonId}`,
                {
                    method: 'DELETE',
                    headers
                }
            )

            if (!response.ok) {
                throw new Error('Не удалось удалить урок')
            }

            setModules((current) =>
                current.map((module) =>
                    module.id === moduleId
                        ? {
                            ...module,
                            lessons: module.lessons.filter(
                                (lesson) => lesson.id !== lessonId
                            )
                        }
                        : module
                )
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка удаления урока')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b12] text-white flex items-center justify-center">
                Загрузка курса...
            </div>
        )
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#0b0b12] text-white p-8">
                <p className="text-red-400">{error || 'Курс не найден'}</p>
                <button
                    onClick={() => navigate('/teacher')}
                    className="mt-4 text-violet-400 hover:text-violet-300"
                >
                    Вернуться к курсам
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0b0b12] text-white">
            <div className="mx-auto max-w-5xl px-6 py-8">

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/teacher')}
                            className="mb-3 text-sm text-gray-400 hover:text-white"
                        >
                            ← К курсам
                        </button>

                        <h1 className="text-3xl font-bold">
                            {course.title}
                        </h1>

                        {course.description && (
                            <p className="mt-2 text-gray-400">
                                {course.description}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                    >
                        На главную
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Модули курса</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Создавай модули и добавляй в них уроки
                        </p>
                    </div>

                    <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-sm text-violet-300">
                        {modules.length} модулей
                    </span>
                </div>

                <div className="space-y-4">
                    {modules.map((module, index) => {
                        const expanded = expandedModules.includes(module.id)

                        return (
                            <div
                                key={module.id}
                                className="overflow-hidden rounded-2xl border border-white/10 bg-[#12121c]"
                            >
                                <div className="flex items-center gap-4 p-5">
                                    <button
                                        onClick={() => toggleModule(module.id)}
                                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 font-semibold text-violet-300">
                                            {index + 1}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-semibold">
                                                {module.title}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {module.lessons.length} уроков
                                            </p>
                                        </div>

                                        <span className="text-gray-500">
                                            {expanded ? '▲' : '▼'}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => deleteModule(module.id)}
                                        className="shrink-0 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                                    >
                                        Удалить
                                    </button>
                                </div>

                                {module.description && (
                                    <p className="border-t border-white/5 px-5 py-3 text-sm text-gray-400">
                                        {module.description}
                                    </p>
                                )}

                                {expanded && (
                                    <div className="border-t border-white/10 bg-[#0e0e17] p-5">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="font-medium text-gray-200">
                                                Уроки модуля
                                            </h4>

                                            <span className="text-xs text-gray-500">
                                                {module.lessons.length} шт.
                                            </span>
                                        </div>

                                        {module.lessons.length === 0 ? (
                                            <p className="mb-4 text-sm text-gray-500">
                                                В этом модуле пока нет уроков
                                            </p>
                                        ) : (
                                            <div className="mb-5 space-y-2">
                                                {module.lessons.map((lesson, lessonIndex) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                                                    >
                                                        <span className="text-sm text-gray-500">
                                                            {lessonIndex + 1}.
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/teacher/courses/${id}/modules/${module.id}/lessons/${lesson.id}`
                                                                )
                                                            }
                                                            className="min-w-0 flex-1 truncate text-left text-sm text-gray-200 hover:text-violet-300"
                                                        >
                                                            {lesson.title}
                                                        </button>

                                                        <span className="hidden rounded-md bg-white/5 px-2 py-1 text-xs text-gray-400 sm:inline">
                                                            {lessonTypeLabels[lesson.type]}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                deleteLesson(module.id, lesson.id)
                                                            }
                                                            className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <form
                                            onSubmit={(e) => createLesson(module.id, e)}
                                            className="rounded-xl border border-white/10 bg-[#12121c] p-4"
                                        >
                                            <h5 className="mb-3 text-sm font-medium">
                                                Добавить урок
                                            </h5>

                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <input
                                                    value={lessonTitles[module.id] || ''}
                                                    onChange={(e) =>
                                                        setLessonTitles((current) => ({
                                                            ...current,
                                                            [module.id]: e.target.value
                                                        }))
                                                    }
                                                    placeholder="Название урока"
                                                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-2.5 text-sm outline-none focus:border-violet-500"
                                                />

                                                <select
                                                    value={lessonTypes[module.id] || 'LECTURE'}
                                                    onChange={(e) =>
                                                        setLessonTypes((current) => ({
                                                            ...current,
                                                            [module.id]: e.target.value as LessonType
                                                        }))
                                                    }
                                                    className="rounded-xl border border-white/10 bg-[#0b0b12] px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                                                >
                                                    <option value="LECTURE">Лекция</option>
                                                    <option value="TEXT">Текстовая теория</option>
                                                    <option value="TEST">Тест</option>
                                                    <option value="CODING_TASK">Задача на программирование</option>
                                                </select>

                                                <button
                                                    type="submit"
                                                    disabled={creatingLesson === module.id}
                                                    className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
                                                >
                                                    {creatingLesson === module.id ? 'Создание...' : 'Добавить'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <form
                    onSubmit={createModule}
                    className="mt-8 rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/[0.03] p-6"
                >
                    <h3 className="mb-4 text-lg font-semibold">
                        Создать новый модуль
                    </h3>

                    <div className="space-y-3">
                        <input
                            value={moduleTitle}
                            onChange={(e) => setModuleTitle(e.target.value)}
                            placeholder="Название модуля"
                            className="w-full rounded-xl border border-white/10 bg-[#12121c] px-4 py-3 text-sm outline-none focus:border-violet-500"
                        />

                        <textarea
                            value={moduleDescription}
                            onChange={(e) => setModuleDescription(e.target.value)}
                            placeholder="Описание модуля (необязательно)"
                            rows={3}
                            className="w-full resize-none rounded-xl border border-white/10 bg-[#12121c] px-4 py-3 text-sm outline-none focus:border-violet-500"
                        />

                        <button
                            type="submit"
                            disabled={creatingModule || !moduleTitle.trim()}
                            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creatingModule ? 'Создание...' : '+ Создать модуль'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CoursePage
