
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MarkdownEditor from '../components/editor/MarkdownEditor'

interface Lesson {
    id: string
    title: string
    content: string | null
    type: 'LECTURE' | 'TEXT' | 'TEST' | 'CODING_TASK'
    position: number
    createdAt: string
}

function LessonPage() {
    const { id, moduleId, lessonId } = useParams()
    const navigate = useNavigate()

    const [lesson, setLesson] = useState<Lesson | null>(null)

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        let isActive = true

        async function loadLesson() {
            try {
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Необходимо авторизоваться')
                }

                const response = await fetch(
                    `http://localhost:8080/api/courses/${id}/modules/${moduleId}/lessons/${lessonId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error(`Не удалось загрузить урок: ${response.status}`)
                }

                const data: Lesson = await response.json()

                if (!isActive) return

                if (data.type === 'TEST') {
                    navigate(
                        `/teacher/courses/${id}/modules/${moduleId}/lessons/${lessonId}/test`,
                        { replace: true }
                    )
                    return
                }

                setLesson(data)
                setTitle(data.title)
                setContent(data.content || '')
            } catch (err) {
                if (isActive) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Ошибка загрузки урока'
                    )
                }
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        loadLesson()

        return () => {
            isActive = false
        }
    }, [id, moduleId, lessonId, navigate])

    async function handleSave(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        setError('')
        setSuccess('')
        setIsSaving(true)

        try {
            const token = localStorage.getItem('token')

            if (!token) {
                throw new Error('Необходимо авторизоваться')
            }

            const response = await fetch(
                `http://localhost:8080/api/courses/${id}/modules/${moduleId}/lessons/${lessonId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        content,
                        type: lesson?.type,
                    }),
                }
            )

            if (!response.ok) {
                throw new Error(`Ошибка сохранения: ${response.status}`)
            }

            const data: Lesson = await response.json()

            setLesson(data)
            setTitle(data.title)
            setContent(data.content || '')

            setSuccess('Изменения сохранены')
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось сохранить урок'
            )
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0b0b12] p-8 text-white">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/teacher/courses/${id}`)}
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        ← К курсу
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        На главную
                    </button>
                </div>

                {isLoading && (
                    <p className="text-gray-400">Загрузка урока...</p>
                )}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
                        {error}
                    </div>
                )}

                {lesson && !isLoading && (
                    <div className="rounded-2xl border border-white/10 bg-[#12121c] p-8">

                        <div className="mb-8">
                            <p className="mb-2 text-sm text-violet-400">
                                Урок {lesson.position + 1}
                            </p>

                            <h1 className="text-3xl font-bold">
                                {lesson.type === 'LECTURE'
                                    ? 'Редактор лекции'
                                    : 'Редактор теории'}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Создан {new Date(lesson.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">

                            <div>
                                <label className="mb-2 block text-sm text-gray-400">
                                    Название урока
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={150}
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-violet-500/50"
                                />
                            </div>

                            <div>
                                <label className="mb-3 block text-sm text-gray-400">
                                    Содержание урока
                                </label>

                                {lesson.type === 'TEXT' ? (
                                    <MarkdownEditor
                                        value={content}
                                        onChange={setContent}
                                        placeholder="Напиши теорию урока..."
                                        minHeight={600}
                                    />
                                ) : (
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={14}
                                        placeholder="Введите содержание лекции..."
                                        className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-violet-500/50"
                                    />
                                )}
                            </div>

                            {success && (
                                <p className="text-sm text-green-400">
                                    {success}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSaving || !title.trim()}
                                className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                            </button>

                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LessonPage
