
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import LessonBlockRenderer from '../components/lesson/LessonBlockRender'
import type { LessonBlock } from '../components/lesson/LessonBlockRender'
import CourseNavigation from '../components/course/CourseNavigation'
import type { Lesson, Module } from '../components/course/courseTypes'

interface Course {
    id: string
    title: string
    description: string | null
    createdAt: string
}

function StudentCoursePage() {
    const { id = '' } = useParams()
    return <StudentCourse key={id} courseId={id} />
}

function StudentCourse({ courseId }: { courseId: string }) {
    const navigate = useNavigate()
    const courseUrl = `http://localhost:8080/api/courses/${courseId}`

    const [course, setCourse] = useState<Course | null>(null)
    const [modules, setModules] = useState<Module[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [courseLoadAttempt, setCourseLoadAttempt] = useState(0)

    const [lessons, setLessons] = useState<Record<string, Lesson[]>>({})
    const [expandedModule, setExpandedModule] = useState<string | null>(null)
    const [loadingModules, setLoadingModules] = useState<Record<string, boolean>>({})
    const [moduleErrors, setModuleErrors] = useState<Record<string, string>>({})

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
    const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>([])
    const [loadingBlocks, setLoadingBlocks] = useState(false)
    const [lessonError, setLessonError] = useState('')
    const [initialLessonStatus, setInitialLessonStatus] =
        useState<'loading' | 'empty' | null>('loading')

    const manualSelection = useRef(false)
    const courseRequest = useRef<AbortController | null>(null)
    const lessonRequest = useRef<AbortController | null>(null)
    const moduleRequests = useRef(new Map<string, Promise<Lesson[] | null>>())

    const loadModuleLessons = useCallback((moduleId: string, signal: AbortSignal) => {
        const requests = moduleRequests.current
        const pending = requests.get(moduleId)
        if (pending) return pending

        setLoadingModules(previous => ({ ...previous, [moduleId]: true }))
        setModuleErrors(previous => ({ ...previous, [moduleId]: '' }))

        async function fetchLessons() {
            try {
                const token = localStorage.getItem('token')
                const url = `${courseUrl}/modules/${moduleId}/lessons/student`
                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal,
                })

                if (!response.ok) throw new Error('Не удалось загрузить уроки')

                const data: Lesson[] = await response.json()
                if (signal.aborted) return null

                setLessons(previous => ({ ...previous, [moduleId]: data }))
                return data
            } catch (error) {
                if (signal.aborted) return null
                console.error('[STUDENT LESSONS] Ошибка:', error)
                setModuleErrors(previous => ({
                    ...previous,
                    [moduleId]: 'Не удалось загрузить уроки',
                }))
                return null
            } finally {
                if (!signal.aborted) {
                    requests.delete(moduleId)
                    setLoadingModules(previous => ({ ...previous, [moduleId]: false }))
                }
            }
        }

        const request = fetchLessons()
        requests.set(moduleId, request)
        return request
    }, [courseUrl])

    const openLesson = useCallback(async (moduleId: string, lesson: Lesson) => {
        lessonRequest.current?.abort()
        setSelectedLesson(lesson)
        setLessonBlocks([])
        setLessonError('')
        setLoadingBlocks(lesson.type === 'LECTURE')

        if (lesson.type !== 'LECTURE') return

        const controller = new AbortController()
        lessonRequest.current = controller
        const { signal } = controller

        try {
            const token = localStorage.getItem('token')
            const url = `${courseUrl}/modules/${moduleId}/lessons/${lesson.id}/blocks/student`
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
                signal,
            })

            if (!response.ok) throw new Error('Не удалось загрузить содержимое лекции')

            const data: LessonBlock[] = await response.json()
            if (!signal.aborted) setLessonBlocks(data)
        } catch (error) {
            if (signal.aborted) return
            console.error('[STUDENT LESSON BLOCKS]', error)
            setLessonError('Не удалось загрузить содержимое урока')
        } finally {
            if (!signal.aborted) setLoadingBlocks(false)
        }
    }, [courseUrl])

    useEffect(() => {
        const controller = new AbortController()
        const { signal } = controller
        courseRequest.current = controller
        const requests = moduleRequests.current

        async function openFirstLesson(courseModules: Module[]) {
            for (const module of courseModules) {
                const moduleLessons = await loadModuleLessons(module.id, signal)
                if (signal.aborted || manualSelection.current) return

                if (moduleLessons === null) {
                    setExpandedModule(module.id)
                    setInitialLessonStatus(null)
                    return
                }

                const firstLesson = moduleLessons[0]
                if (firstLesson) {
                    setExpandedModule(module.id)
                    setInitialLessonStatus(null)
                    void openLesson(module.id, firstLesson)
                    return
                }
            }

            setInitialLessonStatus('empty')
        }

        async function loadCourse() {
            try {
                const token = localStorage.getItem('token')
                const headers = { Authorization: `Bearer ${token}` }
                const [courseResponse, modulesResponse] = await Promise.all([
                    fetch(`${courseUrl}/student`, { headers, signal }),
                    fetch(`${courseUrl}/modules/student`, { headers, signal }),
                ])

                if (!courseResponse.ok || !modulesResponse.ok) {
                    throw new Error('Не удалось загрузить курс')
                }

                const courseData: Course = await courseResponse.json()
                const modulesData: Module[] = await modulesResponse.json()
                if (signal.aborted) return

                setCourse(courseData)
                setModules(modulesData)
                void openFirstLesson(modulesData)
            } catch (error) {
                if (signal.aborted) return
                console.error('[STUDENT COURSE] Ошибка:', error)
                setError('Не удалось загрузить курс. Возможно, он больше недоступен.')
            } finally {
                if (!signal.aborted) setIsLoading(false)
            }
        }

        void loadCourse()

        return () => {
            controller.abort()
            requests.clear()
            lessonRequest.current?.abort()
        }
    }, [courseUrl, courseLoadAttempt, loadModuleLessons, openLesson])

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

    function toggleModule(moduleId: string) {
        manualSelection.current = true
        setInitialLessonStatus(null)

        if (expandedModule === moduleId) {
            setExpandedModule(null)
            return
        }

        setExpandedModule(moduleId)
        requestModuleLessons(moduleId)
    }

    function requestModuleLessons(moduleId: string) {
        const signal = courseRequest.current?.signal
        if (signal && !signal.aborted && !lessons[moduleId]) {
            void loadModuleLessons(moduleId, signal)
        }
    }

    function selectLesson(moduleId: string, lesson: Lesson) {
        manualSelection.current = true
        setInitialLessonStatus(null)
        if (selectedLesson?.id === lesson.id && !lessonError) return

        void openLesson(moduleId, lesson)
    }

    function retryCourse() {
        setIsLoading(true)
        setError('')
        setCourseLoadAttempt(attempt => attempt + 1)
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
            <div className="flex min-h-screen flex-col items-center justify-center
                gap-4 bg-[#0b0b12] px-6 text-center text-white">
                <p role="status" className="text-red-400">
                    {error || 'Курс не найден'}
                </p>

                <Button onClick={retryCourse}>Повторить загрузку</Button>
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

            <main className="mx-auto max-w-6xl py-10 pl-13 pr-4 lg:px-6">
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

                <div className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
                    <CourseNavigation
                        modules={modules}
                        lessons={lessons}
                        expandedModule={expandedModule}
                        loadingModules={loadingModules}
                        moduleErrors={moduleErrors}
                        selectedLessonId={selectedLesson?.id ?? null}
                        onToggleModule={toggleModule}
                        onRetryModule={requestModuleLessons}
                        onOpenLesson={selectLesson}
                        getLessonTypeName={getLessonTypeName}
                    />

                    {selectedLesson ? (
                        <section className="min-w-0 rounded-2xl border border-white/10
                            bg-[#12121d] p-4 sm:p-8">
                            <div className="mb-6">
                                <p className="mb-2 text-sm text-violet-400">
                                    {getLessonTypeName(selectedLesson.type)}
                                </p>
                                <h3 className="text-2xl font-bold wrap-break-word">
                                    {selectedLesson.title}
                                </h3>
                            </div>

                            {loadingBlocks ? (
                                <p role="status" className="text-gray-400">
                                    Загружаем содержимое...
                                </p>
                            ) : lessonError ? (
                                <p role="status" className="text-red-400">
                                    {lessonError}
                                </p>
                            ) : selectedLesson.type === 'LECTURE' ? (
                                lessonBlocks.length === 0 ? (
                                    <p className="text-gray-400">
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
                    ) : (
                        <p
                            role="status"
                            className="rounded-2xl border border-white/10 bg-[#12121d]
                                px-6 py-10 text-center text-sm text-gray-400"
                        >
                            {initialLessonStatus === 'loading' && 'Ищем первый урок...'}
                            {initialLessonStatus === 'empty' && 'В курсе пока нет уроков.'}
                            {initialLessonStatus === null && (
                                'Откройте модуль и выберите урок в программе курса.'
                            )}
                        </p>
                    )}
                </div>
            </main>
        </div>
    )
}

export default StudentCoursePage
