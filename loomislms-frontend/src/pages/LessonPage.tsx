
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

type BlockType = 'TEXT' | 'VIDEO' | 'PRESENTATION' | 'IMAGE' | 'DIVIDER'

interface LessonBlock {
    id?: string
    localKey: string
    type: BlockType
    content: string
    position: number
}

interface UploadedFile {
    id: string
    originalName: string
    contentType: string
    size: number
    url: string
}

const blockTypes: { type: BlockType; label: string; description: string }[] = [
    { type: 'TEXT', label: 'Текст', description: 'Текст с Markdown и формулами' },
    { type: 'VIDEO', label: 'Видео', description: 'Встроенный видеоплеер YouTube' },
    { type: 'PRESENTATION', label: 'Презентация', description: 'Просмотр PDF внутри урока' },
    { type: 'IMAGE', label: 'Изображение', description: 'Картинка по ссылке' },
    { type: 'DIVIDER', label: 'Разделитель', description: 'Визуальное разделение частей урока' },
]

function getYouTubeEmbedUrl(url: string) {
    try {
        const parsed = new URL(url)

        if (parsed.hostname.includes('youtu.be')) {
            return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`
        }

        if (parsed.hostname.includes('youtube.com')) {
            if (parsed.pathname === '/watch') {
                const videoId = parsed.searchParams.get('v')
                return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
            }

            if (parsed.pathname.startsWith('/embed/')) {
                return url
            }
        }

        return ''
    } catch {
        return ''
    }
}

function LessonPage() {
    const { id, moduleId, lessonId } = useParams()
    const navigate = useNavigate()

    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [blocks, setBlocks] = useState<LessonBlock[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [uploadingBlocks, setUploadingBlocks] = useState<Record<string, boolean>>({})
    const [uploadedFileNames, setUploadedFileNames] = useState<Record<string, string>>({})

    const baseUrl = `http://localhost:8080/api/courses/${id}/modules/${moduleId}/lessons/${lessonId}`
    const blocksUrl = `${baseUrl}/blocks`

    useEffect(() => {
        let isActive = true

        async function loadLesson() {
            try {
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Необходимо авторизоваться')
                }

                const response = await fetch(baseUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

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

                if (data.type === 'LECTURE') {
                    const blocksResponse = await fetch(blocksUrl, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    if (!blocksResponse.ok) {
                        throw new Error(`Не удалось загрузить блоки: ${blocksResponse.status}`)
                    }

                    const loadedBlocks: Omit<LessonBlock, 'localKey'>[] =
                        await blocksResponse.json()

                    if (!isActive) return

                    setBlocks(
                        loadedBlocks.map(block => ({
                            ...block,
                            localKey: block.id || crypto.randomUUID(),
                        }))
                    )
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err instanceof Error ? err.message : 'Ошибка загрузки урока'
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
    }, [baseUrl, blocksUrl, id, moduleId, lessonId, navigate])

    async function handleSaveLesson(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        setError('')
        setSuccess('')
        setIsSaving(true)

        try {
            const token = localStorage.getItem('token')

            if (!token) {
                throw new Error('Необходимо авторизоваться')
            }

            const response = await fetch(baseUrl, {
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
            })

            if (!response.ok) {
                throw new Error(`Ошибка сохранения: ${response.status}`)
            }

            const data: Lesson = await response.json()

            setLesson(data)
            setTitle(data.title)
            setContent(data.content || '')
            setSuccess('Изменения урока сохранены')
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Не удалось сохранить урок'
            )
        } finally {
            setIsSaving(false)
        }
    }

    function addBlock(type: BlockType) {
        setBlocks(previous => [
            ...previous,
            {
                localKey: crypto.randomUUID(),
                type,
                content: '',
                position: previous.length,
            },
        ])

        setSuccess('')
    }

    function updateBlock(localKey: string, newContent: string) {
        setBlocks(previous =>
            previous.map(block =>
                block.localKey === localKey
                    ? { ...block, content: newContent }
                    : block
            )
        )

        setSuccess('')
    }

    function removeBlock(localKey: string) {
        setBlocks(previous =>
            previous
                .filter(block => block.localKey !== localKey)
                .map((block, index) => ({ ...block, position: index }))
        )

        setSuccess('')
    }

    function moveBlock(index: number, direction: -1 | 1) {
        const targetIndex = index + direction

        if (targetIndex < 0 || targetIndex >= blocks.length) return

        setBlocks(previous => {
            const updated = [...previous]

            const temp = updated[index]
            updated[index] = updated[targetIndex]
            updated[targetIndex] = temp

            return updated.map((block, position) => ({
                ...block,
                position,
            }))
        })

        setSuccess('')
    }

    async function handleSaveBlocks() {
        setError('')
        setSuccess('')
        setIsSaving(true)

        try {
            const token = localStorage.getItem('token')

            if (!token) {
                throw new Error('Необходимо авторизоваться')
            }

            for (const block of blocks) {
                if (block.type !== 'DIVIDER' && !block.content.trim()) {
                    throw new Error('Заполни содержимое всех блоков')
                }
            }

            const savedBlocks: LessonBlock[] = []

            for (let index = 0; index < blocks.length; index++) {
                const block = blocks[index]

                const body = {
                    type: block.type,
                    content: block.content,
                    position: index,
                }

                const response = await fetch(
                    block.id ? `${blocksUrl}/${block.id}` : blocksUrl,
                    {
                        method: block.id ? 'PUT' : 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(body),
                    }
                )

                if (!response.ok) {
                    throw new Error(`Ошибка сохранения блока: ${response.status}`)
                }

                const savedBlock = await response.json()

                savedBlocks.push({
                    ...savedBlock,
                    localKey: block.localKey,
                })
            }

            const orderResponse = await fetch(`${blocksUrl}/order`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(savedBlocks.map(block => block.id)),
            })

            if (!orderResponse.ok) {
                throw new Error(`Ошибка сохранения порядка: ${orderResponse.status}`)
            }

            setBlocks(
                savedBlocks.map((block, index) => ({
                    ...block,
                    position: index,
                }))
            )

            setSuccess('Блоки лекции сохранены')
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Не удалось сохранить блоки'
            )
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDeleteBlock(block: LessonBlock) {
        if (!confirm('Удалить этот блок?')) return

        setError('')
        setSuccess('')

        try {
            const token = localStorage.getItem('token')

            if (!token) {
                throw new Error('Необходимо авторизоваться')
            }

            if (block.id) {
                const response = await fetch(`${blocksUrl}/${block.id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error(`Ошибка удаления: ${response.status}`)
                }
            }

            removeBlock(block.localKey)
            setSuccess('Блок удалён')
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Не удалось удалить блок'
            )
        }
    }

    async function uploadBlockFile(block: LessonBlock, file: File) {
        setError('')
        setSuccess('')

        const token = localStorage.getItem('token')

        if (!token) {
            setError('Необходимо авторизоваться')
            return
        }

        const allowedTypes: Record<BlockType, string[]> = {
            TEXT: [],
            VIDEO: ['video/mp4', 'video/webm'],
            PRESENTATION: [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ],
            IMAGE: ['image/png', 'image/jpeg', 'image/webp'],
            DIVIDER: [],
        }

        if (!allowedTypes[block.type].includes(file.type)) {
            setError('Формат файла не поддерживается для этого блока')
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setUploadingBlocks(previous => ({
            ...previous,
            [block.localKey]: true,
        }))

        try {
            const response = await fetch(`${baseUrl}/files`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message || `Ошибка загрузки: ${response.status}`)
            }

            const uploadedFile: UploadedFile = await response.json()

            updateBlock(block.localKey, uploadedFile.url)

            setUploadedFileNames(previous => ({
                ...previous,
                [block.localKey]: uploadedFile.originalName,
            }))

            setSuccess(`Файл «${uploadedFile.originalName}» загружен`)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Не удалось загрузить файл'
            )
        } finally {
            setUploadingBlocks(previous => ({
                ...previous,
                [block.localKey]: false,
            }))
        }
    }

    function renderBlockContent(block: LessonBlock) {
        switch (block.type) {
            case 'TEXT':
                return (
                    <MarkdownEditor
                        value={block.content}
                        onChange={value => updateBlock(block.localKey, value)}
                        placeholder="Напиши текст лекции..."
                        minHeight={250}
                    />
                )

            case 'VIDEO':
                return (
                    <div className="space-y-4">
                        <label className="block cursor-pointer rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 p-6 text-center transition hover:bg-violet-500/10">
                            <input
                                type="file"
                                accept="video/mp4,video/webm"
                                className="hidden"
                                disabled={uploadingBlocks[block.localKey]}
                                onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file) uploadBlockFile(block, file)
                                    e.target.value = ''
                                }}
                            />

                            <p className="font-medium text-violet-300">
                                {uploadingBlocks[block.localKey]
                                    ? 'Загрузка видео...'
                                    : 'Выбрать видео'}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                                MP4 или WebM · Максимум 500 МБ
                            </p>
                        </label>

                        {block.content && (
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-sm text-green-400">
                                    Видео прикреплено
                                </p>
                                <p className="mt-1 break-all text-xs text-gray-500">
                                    {uploadedFileNames[block.localKey] || block.content}
                                </p>
                            </div>
                        )}
                    </div>
                )

            case 'PRESENTATION':
                return (
                    <div className="space-y-4">
                        <label className="block cursor-pointer rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 p-6 text-center transition hover:bg-violet-500/10">
                            <input
                                type="file"
                                accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                className="hidden"
                                disabled={uploadingBlocks[block.localKey]}
                                onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file) uploadBlockFile(block, file)
                                    e.target.value = ''
                                }}
                            />

                            <p className="font-medium text-violet-300">
                                {uploadingBlocks[block.localKey]
                                    ? 'Загрузка презентации...'
                                    : 'Выбрать презентацию'}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                                PDF или PPTX · Максимум 500 МБ
                            </p>
                        </label>

                        {block.content && (
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-sm text-green-400">
                                    Презентация прикреплена
                                </p>
                                <p className="mt-1 break-all text-xs text-gray-500">
                                    {uploadedFileNames[block.localKey] || block.content}
                                </p>
                            </div>
                        )}
                    </div>
                )

            case 'IMAGE':
                return (
                    <div className="space-y-4">
                        <label className="block cursor-pointer rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 p-6 text-center transition hover:bg-violet-500/10">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                disabled={uploadingBlocks[block.localKey]}
                                onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file) uploadBlockFile(block, file)
                                    e.target.value = ''
                                }}
                            />

                            <p className="font-medium text-violet-300">
                                {uploadingBlocks[block.localKey]
                                    ? 'Загрузка изображения...'
                                    : 'Выбрать изображение'}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                                PNG, JPG или WEBP
                            </p>
                        </label>

                        {block.content && (
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-sm text-green-400">
                                    Изображение прикреплено
                                </p>
                                <p className="mt-1 break-all text-xs text-gray-500">
                                    {uploadedFileNames[block.localKey] || block.content}
                                </p>
                            </div>
                        )}
                    </div>
                )

            case 'DIVIDER':
                return (
                    <div className="py-4">
                        <div className="border-t border-dashed border-violet-400/50" />
                        <p className="mt-2 text-center text-xs text-gray-500">
                            Разделитель
                        </p>
                    </div>
                )
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
                                    ? 'Конструктор лекции'
                                    : 'Редактор теории'}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Создан {new Date(lesson.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                        </div>

                        <form onSubmit={handleSaveLesson} className="space-y-6">

                            <div>
                                <label className="mb-2 block text-sm text-gray-400">
                                    Название урока
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    maxLength={150}
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-violet-500/50"
                                />
                            </div>

                            {lesson.type === 'TEXT' && (
                                <div>
                                    <label className="mb-3 block text-sm text-gray-400">
                                        Содержание урока
                                    </label>

                                    <MarkdownEditor
                                        value={content}
                                        onChange={setContent}
                                        placeholder="Напиши теорию урока..."
                                        minHeight={600}
                                    />
                                </div>
                            )}

                            {lesson.type === 'CODING_TASK' && (
                                <div>
                                    <label className="mb-3 block text-sm text-gray-400">
                                        Условие задачи
                                    </label>

                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        rows={14}
                                        placeholder="Введите условие задачи..."
                                        className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-violet-500/50"
                                    />
                                </div>
                            )}

                            {lesson.type !== 'LECTURE' && (
                                <>
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
                                </>
                            )}
                        </form>

                        {lesson.type === 'LECTURE' && (
                            <div className="mt-8 space-y-8">

                                <div>
                                    <div className="mb-4">
                                        <h2 className="text-xl font-semibold">
                                            Блоки лекции
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Собирай лекцию из отдельных элементов в нужном порядке.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {blockTypes.map(item => (
                                            <button
                                                key={item.type}
                                                type="button"
                                                onClick={() => addBlock(item.type)}
                                                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-violet-500/50 hover:bg-violet-500/5"
                                            >
                                                <p className="font-medium text-white">
                                                    + {item.label}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {item.description}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {blocks.length === 0 && (
                                        <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
                                            <p className="text-gray-400">
                                                В лекции пока нет блоков
                                            </p>
                                            <p className="mt-2 text-sm text-gray-600">
                                                Добавь первый блок выше
                                            </p>
                                        </div>
                                    )}

                                    {blocks.map((block, index) => (
                                        <div
                                            key={block.localKey}
                                            className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                                        >
                                            <div className="mb-5 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-sm font-semibold text-violet-400">
                                                        {index + 1}
                                                    </span>

                                                    <div>
                                                        <p className="font-medium">
                                                            {blockTypes.find(item => item.type === block.type)?.label}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {block.id ? 'Сохранённый блок' : 'Новый блок'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveBlock(index, -1)}
                                                        disabled={index === 0}
                                                        title="Переместить вверх"
                                                        className="rounded-lg border border-white/10 px-3 py-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                                                    >
                                                        ↑
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => moveBlock(index, 1)}
                                                        disabled={index === blocks.length - 1}
                                                        title="Переместить вниз"
                                                        className="rounded-lg border border-white/10 px-3 py-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                                                    >
                                                        ↓
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteBlock(block)}
                                                        title="Удалить блок"
                                                        className="rounded-lg border border-red-500/20 px-3 py-2 text-red-400 transition hover:bg-red-500/10"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>

                                            {renderBlockContent(block)}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
                                    <button
                                        type="button"
                                        onClick={handleSaveLesson}
                                        disabled={isSaving || !title.trim()}
                                        className="rounded-xl border border-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
                                    >
                                        Сохранить название
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSaveBlocks}
                                        disabled={isSaving}
                                        className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSaving ? 'Сохранение...' : 'Сохранить блоки лекции'}
                                    </button>

                                    {success && (
                                        <p className="text-sm text-green-400">
                                            {success}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LessonPage
