import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface Course {
    id: string
    title: string
    description: string | null
    createdAt: string
}

interface Lesson {
    id: string
    title: string
    content: string | null
    position: number
    createdAt: string
}

function CoursePage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [course, setCourse] = useState<Course | null>(null)
    const [lessons, setLessons] = useState<Lesson[]>([])

    const [lessonTitle, setLessonTitle] = useState('')
    const [lessonContent, setLessonContent] = useState('')

    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null)
    const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    async function loadLessons() {
        const token = localStorage.getItem('token')

        const response = await fetch(
            `http://localhost:8080/api/courses/${id}/lessons`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )

        if (!response.ok) {
            throw new Error('Не удалось загрузить уроки')
        }

        const data: Lesson[] = await response.json()
        setLessons(data)
    }

    useEffect(() => {
        let isActive = true

        async function loadCourse() {
            setIsLoading(true)
            setError('')

            try {
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Необходимо авторизоваться')
                }

                const response = await fetch(
                    `http://localhost:8080/api/courses/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Курс не найден или у вас нет доступа')
                    }

                    throw new Error(`Ошибка загрузки курса: ${response.status}`)
                }

                const data: Course = await response.json()

                if (isActive) {
                    setCourse(data)
                    await loadLessons()
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Не удалось загрузить курс'
                    )
                }
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        loadCourse()

        return () => {
            isActive = false
        }
    }, [id])

    async function handleCreateLesson(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        setError('')
        setSuccess('')
        setIsCreating(true)

        try {
            const token = localStorage.getItem('token')

            if (!token) {
                throw new Error('Необходимо авторизоваться')
            }

            const response = await fetch(
                `http://localhost:8080/api/courses/${id}/lessons`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: lessonTitle,
                        content: lessonContent,
                    }),
                }
            )

            if (!response.ok) {
                throw new Error(`Ошибка создания урока: ${response.status}`)
            }

            setLessonTitle('')
            setLessonContent('')

            await loadLessons()

            setSuccess('Урок успешно создан')
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось создать урок'
            )
        } finally {
            setIsCreating(false)
        }
    }

    async function handleDeleteLesson(lessonId: string) {
        const confirmed = window.confirm('Удалить этот урок?')

        if (!confirmed) {
            return
        }

        setError('')
        setSuccess('')
        setIsDeleting(lessonId)

        try {
            const token = localStorage.getItem('token')

            const response = await fetch(
                `http://localhost:8080/api/courses/${id}/lessons/${lessonId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error(`Ошибка удаления урока: ${response.status}`)
            }

            await loadLessons()
            setSuccess('Урок удалён')
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось удалить урок'
            )
        } finally {
            setIsDeleting(null)
        }
    }

    async function handleDrop(targetLessonId: string) {
        if (!draggedLessonId || draggedLessonId === targetLessonId) {
            setDraggedLessonId(null)
            setDragOverLessonId(null)
            return
        }

        const previousLessons = [...lessons]
        const newLessons = [...lessons]

        const draggedIndex = newLessons.findIndex(
            lesson => lesson.id === draggedLessonId
        )

        const targetIndex = newLessons.findIndex(
            lesson => lesson.id === targetLessonId
        )

        if (draggedIndex === -1 || targetIndex === -1) {
            return
        }

        const [draggedLesson] = newLessons.splice(draggedIndex, 1)
        newLessons.splice(targetIndex, 0, draggedLesson)

        setLessons(newLessons)
        setDraggedLessonId(null)
        setDragOverLessonId(null)
        setError('')

        try {
            const token = localStorage.getItem('token')

            const response = await fetch(
                `http://localhost:8080/api/courses/${id}/lessons/order`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        lessonIds: newLessons.map(lesson => lesson.id),
                    }),
                }
            )

            if (!response.ok) {
                throw new Error('Не удалось сохранить порядок уроков')
            }

            setSuccess('Порядок уроков сохранён')
        } catch (err) {
            setLessons(previousLessons)

            setError(
                err instanceof Error
                    ? err.message
                    : 'Ошибка изменения порядка'
            )
        }
    }

    return (
        <div className="min-h-screen bg-[#0b0b12] p-8 text-white">
            <div className="mx-auto max-w-5xl">

                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/teacher')}
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        ← К курсам
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        На главную
                    </button>
                </div>

                {isLoading && (
                    <p className="text-gray-400">
                        Загрузка курса...
                    </p>
                )}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
                        {error}
                    </div>
                )}

                {course && !isLoading && (
                    <>
                        <div className="mb-8 rounded-2xl border border-white/10 bg-[#12121c] p-8">

                            <div className="mb-6 flex items-center justify-between">
                                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                                    Черновик
                                </span>

                                <span className="text-sm text-gray-500">
                                    {new Date(course.createdAt).toLocaleDateString('ru-RU')}
                                </span>
                            </div>

                            <h1 className="mb-4 text-3xl font-bold">
                                {course.title}
                            </h1>

                            <p className="whitespace-pre-wrap text-gray-400">
                                {course.description || 'Описание отсутствует'}
                            </p>

                            <div className="mt-8 border-t border-white/10 pt-6">
                                <p className="text-xs text-gray-500">
                                    ID курса
                                </p>

                                <p className="mt-1 text-sm text-gray-400">
                                    {course.id}
                                </p>
                            </div>
                        </div>

                        {/* Lessons */}
                        <div className="mb-8">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    Уроки курса
                                </h2>

                                <span className="text-sm text-gray-500">
                                    {lessons.length} уроков
                                </span>
                            </div>

                            {lessons.length === 0 ? (
                                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-gray-500">
                                    Пока нет уроков. Создайте первый!
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lessons.map((lesson, index) => (
                                        <div
                                            key={lesson.id}
                                            draggable={isDeleting !== lesson.id}
                                            onDragStart={(e) => {
                                                setDraggedLessonId(lesson.id)
                                                e.dataTransfer.effectAllowed = 'move'
                                                e.dataTransfer.setData('text/plain', lesson.id)
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault()
                                                setDragOverLessonId(lesson.id)
                                            }}
                                            onDragLeave={() => {
                                                setDragOverLessonId(null)
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault()
                                                handleDrop(lesson.id)
                                            }}
                                            onDragEnd={() => {
                                                setDraggedLessonId(null)
                                                setDragOverLessonId(null)
                                            }}
                                            className={`flex items-center gap-4 rounded-xl border bg-[#12121c] p-5 transition ${
                                                dragOverLessonId === lesson.id
                                                    ? 'border-violet-500 bg-violet-500/10'
                                                    : 'border-white/10'
                                            } ${
                                                draggedLessonId === lesson.id
                                                    ? 'opacity-40'
                                                    : ''
                                            }`}
                                        >
                                            <div className="cursor-grab select-none text-xl text-gray-600 active:cursor-grabbing">
                                                ⠿
                                            </div>

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 font-semibold text-violet-400">
                                                {index + 1}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold">
                                                    {lesson.title}
                                                </h3>

                                                <p className="mt-1 truncate text-sm text-gray-500">
                                                    {lesson.content || 'Без содержания'}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isDeleting === lesson.id}
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                                title="Удалить урок"
                                            >
                                                {isDeleting === lesson.id ? '...' : '×'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Create lesson */}
                        <div className="rounded-2xl border border-white/10 bg-[#12121c] p-8">
                            <h2 className="mb-6 text-xl font-bold">
                                Добавить урок
                            </h2>

                            <form
                                onSubmit={handleCreateLesson}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="mb-2 block text-sm text-gray-400">
                                        Название урока
                                    </label>

                                    <input
                                        type="text"
                                        value={lessonTitle}
                                        onChange={(e) => setLessonTitle(e.target.value)}
                                        placeholder="Например, Введение в Java"
                                        required
                                        maxLength={150}
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-gray-400">
                                        Содержание урока
                                    </label>

                                    <textarea
                                        value={lessonContent}
                                        onChange={(e) => setLessonContent(e.target.value)}
                                        placeholder="Введите содержание урока..."
                                        rows={5}
                                        className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500/50"
                                    />
                                </div>

                                {success && (
                                    <p className="text-sm text-green-400">
                                        {success}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isCreating || !lessonTitle.trim()}
                                    className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isCreating ? 'Создание...' : 'Создать урок'}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CoursePage