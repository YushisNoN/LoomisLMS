import { useId } from 'react'
import Button from '../ui/Button'
import type { Lesson, Module } from './courseTypes'

interface Props {
    modules: Module[]
    lessons: Record<string, Lesson[]>
    expandedModule: string | null
    loadingModules: Record<string, boolean>
    moduleErrors: Record<string, string>
    selectedLessonId: string | null
    onToggleModule: (moduleId: string) => void
    onRetryModule: (moduleId: string) => void
    onOpenLesson: (moduleId: string, lesson: Lesson) => void
    getLessonTypeName: (type: Lesson['type']) => string
}

interface ModuleLessonListProps {
    lessons: Lesson[] | undefined
    isLoading: boolean
    error: string
    selectedLessonId: string | null
    onRetry: () => void
    onOpenLesson: (lesson: Lesson) => void
    getLessonTypeName: (type: Lesson['type']) => string
}

function ModuleLessonList({
    lessons,
    isLoading,
    error,
    selectedLessonId,
    onRetry,
    onOpenLesson,
    getLessonTypeName
}: ModuleLessonListProps) {
    if (isLoading) {
        return (
            <p role="status" className="px-2 text-sm text-gray-400">
                Загружаем уроки...
            </p>
        )
    }

    if (error) {
        return (
            <div className="space-y-2 px-2">
                <p role="status" className="text-sm text-red-400">{error}</p>
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    Повторить
                </Button>
            </div>
        )
    }

    if (!lessons?.length) {
        return <p className="px-2 text-sm text-gray-400">В этом модуле пока нет уроков.</p>
    }

    return (
        <ul className="space-y-1">
            {lessons.map(lesson => (
                <li key={lesson.id}>
                    <button
                        type="button"
                        aria-current={lesson.id === selectedLessonId}
                        onClick={() => onOpenLesson(lesson)}
                        className="w-full rounded-lg px-2 py-2 text-left text-sm text-gray-300
                            hover:bg-white/[0.06] aria-current:bg-violet-500/15
                            aria-current:text-violet-200"
                    >
                        <span className="block wrap-break-word">{lesson.title}</span>
                        <span className="block text-xs text-gray-400">
                            {getLessonTypeName(lesson.type)}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    )
}

function CourseSidebar({
    modules,
    lessons,
    expandedModule,
    loadingModules,
    moduleErrors,
    selectedLessonId,
    onToggleModule,
    onRetryModule,
    onOpenLesson,
    getLessonTypeName
}: Props) {
    const headingId = useId()

    return (
        <nav
            aria-labelledby={headingId}
            className="rounded-2xl border border-white/10 bg-[#12121d] p-4
                lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto"
        >
            <h3 id={headingId} className="mb-4 px-2 text-sm font-semibold">
                Программа курса
            </h3>

            {modules.length === 0 && (
                <p className="px-2 text-sm text-gray-400">В этом курсе пока нет модулей.</p>
            )}

            <ul className="space-y-2">
                {modules.map(module => {
                    const expanded = expandedModule === module.id

                    return (
                        <li key={module.id}>
                            <button
                                type="button"
                                aria-expanded={expanded}
                                onClick={() => onToggleModule(module.id)}
                                className="flex w-full items-start justify-between gap-3 rounded-lg
                                    bg-white/[0.03] px-3 py-2 text-left text-sm
                                    hover:bg-white/[0.06]"
                            >
                                <span className="min-w-0 font-medium wrap-break-word">
                                    {module.title}
                                </span>
                                <span aria-hidden="true" className="text-violet-300">
                                    {expanded ? '−' : '+'}
                                </span>
                            </button>

                            {expanded && (
                                <div className="mt-2 space-y-2 pl-3">
                                    {module.description && (
                                        <p className="px-2 text-xs text-gray-400 wrap-break-word">
                                            {module.description}
                                        </p>
                                    )}

                                    <ModuleLessonList
                                        lessons={lessons[module.id]}
                                        isLoading={loadingModules[module.id] === true}
                                        error={moduleErrors[module.id] ?? ''}
                                        selectedLessonId={selectedLessonId}
                                        onRetry={() => onRetryModule(module.id)}
                                        onOpenLesson={lesson => onOpenLesson(module.id, lesson)}
                                        getLessonTypeName={getLessonTypeName}
                                    />
                                </div>
                            )}
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

export default CourseSidebar
