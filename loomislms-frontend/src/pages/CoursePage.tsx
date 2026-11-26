import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface Course {
    id: string
    title: string
    description: string | null
    createdAt: string
}

function CoursePage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [course, setCourse] = useState<Course | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

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

    return (
        <div className="min-h-screen bg-[#0b0b12] p-8 text-white">
            <div className="mx-auto max-w-5xl">

                <button
                    onClick={() => navigate('/teacher')}
                    className="mb-8 text-sm text-gray-400 transition hover:text-white"
                >
                    ← Назад к курсам
                </button>

                {isLoading && (
                    <p className="text-gray-400">
                        Загрузка курса...
                    </p>
                )}

                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
                        {error}
                    </div>
                )}

                {course && !isLoading && (
                    <div className="rounded-2xl border border-white/10 bg-[#12121c] p-8">

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
                )}
            </div>
        </div>
    )
}

export default CoursePage