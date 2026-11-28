
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import LessonBlockRenderer from '../components/lesson/LessonBlockRender'
import type { LessonBlock } from '../components/lesson/LessonBlockRender'

interface Course {
    id: string
    title: string
    description: string | null
    createdAt: string
}

interface Module {
    id: string
    title: string
    description: string | null
    position: number
}

interface Lesson {
    id: string
    title: string
    content: string | null
    type: 'LECTURE' | 'TEXT' | 'TEST' | 'CODING_TASK'
    position: number
}

function StudentCoursePage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [course, setCourse] = useState<Course | null>(null)
    const [modules, setModules] = useState<Module[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const [lessons, setLessons] = useState<Record<string, Lesson[]>>({})
    const [expandedModule, setExpandedModule] = useState<string | null>(null)
    const [loadingModule, setLoadingModule] = useState<string | null>(null)
    const [moduleError, setModuleError] = useState('')

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
    const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>([])
    const [loadingBlocks, setLoadingBlocks] = useState(false)
    const [lessonError, setLessonError] = useState('')

    useEffect(() => {
        async function loadCourse() {
            try {
                const token = localStorage.getItem('token')

                const headers = {
                    Authorization: `Bearer ${token}`,
                }

                const [courseResponse, modulesResponse] = await Promise.all([
                    fetch(`http://localhost:8080/api/courses/${id}/student`, {
                        headers,
                    }),
                    fetch(`http://localhost:8080/api/courses/${id}/modules/student`, {
                        headers,
                    }),
                ])

                if (!courseResponse.ok || !modulesResponse.ok) {
                    throw new Error('Не удалось загрузить курс')
                }

                const courseData: Course = await courseResponse.json()
                const modulesData: Module[] = await modulesResponse.json()

                setCourse(courseData)
                setModules(modulesData)
            } catch (error) {
                console.error('[STUDENT COURSE] Ошибка:', error)
                setError('Не удалось загрузить курс. Возможно, он больше недоступен.')
            } finally {
                setIsLoading(false)
            }
        }

        loadCourse()
    }, [id])

    function getLessonTypeName(type: Lesson['type']) {
        switch (type) {
            case 'LECTURE':
                return 'Лекция'
            case 'TEXT':
                return 'Теория'
            case 'TEST':
                return 'Тест'
            case 'CODING_TASK':
                return 'Задача на программирование'
            default:
                return 'Урок'
        }
    }

    async function toggleModule(moduleId: string) {
        if (expandedModule === moduleId) {
            setExpandedModule(null)

            if (selectedLesson) {
                const currentLessons = lessons[moduleId] || []
                const belongsToModule = currentLessons.some(
                    lesson => lesson.id === selectedLesson.id
                )

                if (belongsToModule) {
                    setSelectedLesson(null)
                    setLessonBlocks([])
                    setLessonError('')
                }
            }

            return
        }

        setExpandedModule(moduleId)
        setModuleError('')

        if (lessons[moduleId]) {
            return
        }

        try {
            setLoadingModule(moduleId)

            const token = localStorage.getItem('token')

            const response = await fetch(
                `http://localhost:8080/api/courses/${id}/modules/${moduleId}/lessons/student`,
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

            setLessons(prev => ({
                ...prev,
                [moduleId]: data,
            }))
        } catch (error) {
            console.error('[STUDENT LESSONS] Ошибка:', error)
            setModuleError('Не удалось загрузить уроки')
        } finally {
            setLoadingModule(null)
        }
    }

    async function openLesson(lesson: Lesson) {
        setSelectedLesson(lesson)
        setLessonBlocks([])
        setLessonError('')

        if (lesson.type !== 'LECTURE') {
            return
        }

        if (!expandedModule) {
            return
        }

        try {
            setLoadingBlocks(true)

            const token = localStorage.getItem('token')

            const response = await fetch(
                `http://localhost:8080/api/courses/${id}/modules/${expandedModule}/lessons/${lesson.id}/blocks/student`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Не удалось загрузить содержимое лекции')
            }

            const data: LessonBlock[] = await response.json()
            setLessonBlocks(data)
        } catch (error) {
            console.error('[STUDENT LESSON BLOCKS]', error)
            setLessonError('Не удалось загрузить содержимое урока')
        } finally {
            setLoadingBlocks(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0b0b12] text-gray-400">
                Загружаем курс...
            </div>
        )
    }

    if (error || !course) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0b0b12] text-white">
                <p className="text-red-400">
                    {error || 'Курс не найден'}
                </p>

                <Button
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                >
                    Вернуться в Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0b0b12] text-white">
            <header className="border-b border-white/10 bg-[#101019]">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                    <div>
                        <h1 className="text-xl font-bold">
                            Loomis<span className="text-violet-400">LMS</span>
                        </h1>

                        <p className="text-xs text-gray-500">
                            Обучение
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Дашборд
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-10">
                    <p className="mb-3 text-sm text-gray-500">
                        Dashboard / Мои курсы / {course.title}
                    </p>

                    <h2 className="text-3xl font-bold">
                        {course.title}
                    </h2>

                    <p className="mt-4 max-w-3xl leading-7 text-gray-400">
                        {course.description || 'Описание курса пока отсутствует'}
                    </p>
                </div>

                <section>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold">
                            Программа курса
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            {modules.length} модулей
                        </p>
                    </div>

                    {modules.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-gray-500">
                            В этом курсе пока нет модулей.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {modules.map((module, index) => {
                                const isExpanded = expandedModule === module.id

                                return (
                                    <div
                                        key={module.id}
                                        className="overflow-hidden rounded-2xl border border-white/10 bg-[#12121d]"
                                    >
                                        <button
                                            onClick={() => toggleModule(module.id)}
                                            className="flex w-full items-center justify-between p-6 text-left transition hover:bg-white/[0.03]"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 font-semibold text-violet-300">
                                                    {index + 1}
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold">
                                                        {module.title}
                                                    </h4>

                                                    {module.description && (
                                                        <p className="mt-2 text-sm leading-6 text-gray-500">
                                                            {module.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <span className="ml-4 text-gray-400">
                                                {isExpanded ? '−' : '+'}
                                            </span>
                                        </button>

                                        {isExpanded && (
                                            <div className="border-t border-white/10 px-6 py-4">
                                                {loadingModule === module.id ? (
                                                    <p className="py-4 text-sm text-gray-500">
                                                        Загружаем уроки...
                                                    </p>
                                                ) : moduleError ? (
                                                    <p className="py-4 text-sm text-red-400">
                                                        {moduleError}
                                                    </p>
                                                ) : lessons[module.id]?.length ? (
                                                    <div className="space-y-2">
                                                        {lessons[module.id].map((lesson, lessonIndex) => (
                                                            <button
                                                                key={lesson.id}
                                                                onClick={() => openLesson(lesson)}
                                                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                                                                    selectedLesson?.id === lesson.id
                                                                        ? 'border border-violet-500/30 bg-violet-500/15'
                                                                        : 'bg-white/[0.03] hover:bg-white/[0.06]'
                                                                }`}
                                                            >
                                                                <span className="text-sm text-violet-400">
                                                                    {lessonIndex + 1}.
                                                                </span>

                                                                <span className="text-sm text-gray-300">
                                                                    {lesson.title}
                                                                </span>

                                                                <span className="ml-auto text-xs text-gray-500">
                                                                    {getLessonTypeName(lesson.type)}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="py-4 text-sm text-gray-500">
                                                        В этом модуле пока нет уроков.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>

                {selectedLesson && (
                    <section className="mt-8 rounded-2xl border border-white/10 bg-[#12121d] p-6 sm:p-8">
                        <div className="mb-6">
                            <p className="mb-2 text-sm text-violet-400">
                                {getLessonTypeName(selectedLesson.type)}
                            </p>

                            <h3 className="text-2xl font-bold">
                                {selectedLesson.title}
                            </h3>
                        </div>

                        {loadingBlocks ? (
                            <p className="text-gray-500">
                                Загружаем содержимое...
                            </p>
                        ) : lessonError ? (
                            <p className="text-red-400">
                                {lessonError}
                            </p>
                        ) : selectedLesson.type === 'LECTURE' ? (
                            lessonBlocks.length === 0 ? (
                                <p className="text-gray-500">
                                    В этой лекции пока нет содержимого.
                                </p>
                            ) : (
                                <LessonBlockRenderer blocks={lessonBlocks} />
                            )
                        ) : (
                            <div className="whitespace-pre-wrap leading-7 text-gray-300">
                                {selectedLesson.content || 'Содержимое урока пока отсутствует.'}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    )
}

export default StudentCoursePage
