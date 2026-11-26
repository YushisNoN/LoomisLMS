
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT'

interface AnswerOption {
    id?: string
    text: string
    correct: boolean
}

interface TestQuestion {
    id: string
    question: string
    type: QuestionType
    explanation: string | null
    position: number
    options: AnswerOption[]
    acceptedTextAnswers: string[]
}

function TestEditorPage() {
    const { id, moduleId, lessonId } = useParams()
    const navigate = useNavigate()

    const [questions, setQuestions] = useState<TestQuestion[]>([])
    const [lessonTitle, setLessonTitle] = useState('')

    const [question, setQuestion] = useState('')
    const [type, setType] = useState<QuestionType>('SINGLE_CHOICE')
    const [explanation, setExplanation] = useState('')

    const [options, setOptions] = useState<AnswerOption[]>([
        { text: '', correct: true },
        { text: '', correct: false },
    ])

    const [acceptedAnswers, setAcceptedAnswers] = useState<string[]>([''])

    const [editingId, setEditingId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const baseUrl = `http://localhost:8080/api/courses/${id}/modules/${moduleId}/lessons/${lessonId}`
    const questionsUrl = `${baseUrl}/questions`

    useEffect(() => {
        let active = true

        async function loadData() {
            try {
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Необходимо авторизоваться')
                }

                const [lessonResponse, questionsResponse] = await Promise.all([
                    fetch(baseUrl, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch(questionsUrl, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ])

                if (!lessonResponse.ok || !questionsResponse.ok) {
                    throw new Error('Не удалось загрузить тест')
                }

                const lesson = await lessonResponse.json()
                const loadedQuestions: TestQuestion[] = await questionsResponse.json()

                if (!active) return

                if (lesson.type !== 'TEST') {
                    throw new Error('Этот урок не является тестом')
                }

                setLessonTitle(lesson.title)
                setQuestions(loadedQuestions)
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Ошибка загрузки теста'
                    )
                }
            } finally {
                if (active) {
                    setIsLoading(false)
                }
            }
        }

        loadData()

        return () => {
            active = false
        }
    }, [baseUrl, questionsUrl])

    function resetForm() {
        setQuestion('')
        setType('SINGLE_CHOICE')
        setExplanation('')
        setOptions([
            { text: '', correct: true },
            { text: '', correct: false },
        ])
        setAcceptedAnswers([''])
        setEditingId(null)
    }

    function addOption() {
        setOptions([
            ...options,
            { text: '', correct: false },
        ])
    }

    function updateOption(index: number, field: keyof AnswerOption, value: string | boolean) {
        const updated = [...options]

        if (field === 'correct' && type === 'SINGLE_CHOICE' && value === true) {
            updated.forEach(option => {
                option.correct = false
            })
        }

        updated[index] = {
            ...updated[index],
            [field]: value,
        }

        setOptions(updated)
    }

    function removeOption(index: number) {
        if (options.length <= 2) return

        setOptions(options.filter((_, i) => i !== index))
    }

    function addAcceptedAnswer() {
        setAcceptedAnswers([...acceptedAnswers, ''])
    }

    function updateAcceptedAnswer(index: number, value: string) {
        const updated = [...acceptedAnswers]
        updated[index] = value
        setAcceptedAnswers(updated)
    }

    function removeAcceptedAnswer(index: number) {
        if (acceptedAnswers.length <= 1) return

        setAcceptedAnswers(acceptedAnswers.filter((_, i) => i !== index))
    }

    function editQuestion(item: TestQuestion) {
        setEditingId(item.id)
        setQuestion(item.question)
        setType(item.type)
        setExplanation(item.explanation || '')

        setOptions(
            item.options.map(option => ({
                id: option.id,
                text: option.text,
                correct: option.correct,
            }))
        )

        setAcceptedAnswers(
            item.acceptedTextAnswers.length > 0
                ? [...item.acceptedTextAnswers]
                : ['']
        )

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        setError('')
        setSuccess('')

        if (!question.trim()) {
            setError('Введите текст вопроса')
            return
        }

        if (type !== 'TEXT') {
            if (options.some(option => !option.text.trim())) {
                setError('Заполните все варианты ответа')
                return
            }

            if (!options.some(option => option.correct)) {
                setError('Отметьте правильный ответ')
                return
            }

            if (type === 'SINGLE_CHOICE' &&
                options.filter(option => option.correct).length !== 1) {
                setError('Выберите только один правильный ответ')
                return
            }
        }

        if (type === 'TEXT' && !acceptedAnswers.some(answer => answer.trim())) {
            setError('Добавьте хотя бы один правильный ответ')
            return
        }

        setIsSaving(true)

        try {
            const token = localStorage.getItem('token')

            if (!token) {
                throw new Error('Необходимо авторизоваться')
            }

            const body = {
                question: question.trim(),
                type,
                explanation,
                options: type === 'TEXT' ? [] : options,
                acceptedTextAnswers: type === 'TEXT'
                    ? acceptedAnswers.filter(answer => answer.trim())
                    : [],
            }

            const response = await fetch(
                editingId
                    ? `${questionsUrl}/${editingId}`
                    : questionsUrl,
                {
                    method: editingId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                }
            )

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message || `Ошибка сохранения: ${response.status}`)
            }

            const savedQuestion: TestQuestion = await response.json()

            if (editingId) {
                setQuestions(previous =>
                    previous.map(item =>
                        item.id === savedQuestion.id ? savedQuestion : item
                    )
                )
            } else {
                setQuestions(previous => [...previous, savedQuestion])
            }

            resetForm()
            setSuccess('Вопрос сохранён')
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось сохранить вопрос'
            )
        } finally {
            setIsSaving(false)
        }
    }

    async function deleteQuestion(questionId: string) {
        if (!window.confirm('Удалить этот вопрос?')) return

        try {
            const token = localStorage.getItem('token')

            const response = await fetch(
                `${questionsUrl}/${questionId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Не удалось удалить вопрос')
            }

            setQuestions(previous =>
                previous.filter(item => item.id !== questionId)
            )

            if (editingId === questionId) {
                resetForm()
            }

            setSuccess('Вопрос удалён')
            setError('')
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ошибка удаления'
            )
        }
    }

    function changeType(newType: QuestionType) {
        setType(newType)

        if (newType === 'TEXT') {
            setAcceptedAnswers([''])
        } else {
            setOptions([
                { text: '', correct: true },
                { text: '', correct: false },
            ])
        }
    }

    return (
        <div className="min-h-screen bg-[#0b0b12] p-6 text-white md:p-8">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8 flex flex-wrap items-center gap-4">
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

                <div className="mb-8">
                    <p className="mb-2 text-sm font-medium text-violet-400">
                        Редактор теста
                    </p>

                    <h1 className="text-3xl font-bold">
                        {lessonTitle || 'Загрузка теста...'}
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Вопросов: {questions.length}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
                        {success}
                    </div>
                )}

                {isLoading ? (
                    <p className="text-gray-400">Загрузка...</p>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

                        {/* Question editor */}
                        <div className="rounded-2xl border border-white/10 bg-[#12121c] p-6 md:p-8">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    {editingId ? 'Редактирование вопроса' : 'Новый вопрос'}
                                </h2>

                                {editingId && (
                                    <button
                                        onClick={resetForm}
                                        className="text-sm text-gray-400 hover:text-white"
                                    >
                                        Отмена
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">

                                <div>
                                    <label className="mb-2 block text-sm text-gray-400">
                                        Тип вопроса
                                    </label>

                                    <select
                                        value={type}
                                        onChange={e => changeType(e.target.value as QuestionType)}
                                        className="w-full rounded-xl border border-white/10 bg-[#1a1a28] px-4 py-3 text-white outline-none focus:border-violet-500"
                                    >
                                        <option value="SINGLE_CHOICE">
                                            Один правильный ответ
                                        </option>
                                        <option value="MULTIPLE_CHOICE">
                                            Несколько правильных ответов
                                        </option>
                                        <option value="TEXT">
                                            Текстовый ответ
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-gray-400">
                                        Текст вопроса
                                    </label>

                                    <textarea
                                        value={question}
                                        onChange={e => setQuestion(e.target.value)}
                                        rows={4}
                                        required
                                        placeholder="Введите вопрос..."
                                        className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
                                    />
                                </div>

                                {type !== 'TEXT' ? (
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="text-sm text-gray-400">
                                                Варианты ответа
                                            </label>

                                            <button
                                                type="button"
                                                onClick={addOption}
                                                className="text-sm text-violet-400 hover:text-violet-300"
                                            >
                                                + Добавить вариант
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {options.map((option, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3"
                                                >
                                                    <input
                                                        type={type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                                                        checked={option.correct}
                                                        onChange={e =>
                                                            updateOption(index, 'correct', e.target.checked)
                                                        }
                                                        className="h-4 w-4 accent-violet-500"
                                                    />

                                                    <input
                                                        value={option.text}
                                                        onChange={e =>
                                                            updateOption(index, 'text', e.target.value)
                                                        }
                                                        placeholder={`Вариант ${index + 1}`}
                                                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(index)}
                                                        disabled={options.length <= 2}
                                                        className="px-2 text-gray-500 transition hover:text-red-400 disabled:opacity-30"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="mt-3 text-xs text-gray-500">
                                            Отметь правильные варианты ответа.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="text-sm text-gray-400">
                                                Допустимые ответы
                                            </label>

                                            <button
                                                type="button"
                                                onClick={addAcceptedAnswer}
                                                className="text-sm text-violet-400 hover:text-violet-300"
                                            >
                                                + Добавить ответ
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {acceptedAnswers.map((answer, index) => (
                                                <div key={index} className="flex gap-3">
                                                    <input
                                                        value={answer}
                                                        onChange={e =>
                                                            updateAcceptedAnswer(index, e.target.value)
                                                        }
                                                        placeholder={`Правильный ответ ${index + 1}`}
                                                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => removeAcceptedAnswer(index)}
                                                        disabled={acceptedAnswers.length <= 1}
                                                        className="px-2 text-gray-500 hover:text-red-400 disabled:opacity-30"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="mt-3 text-xs text-gray-500">
                                            Ученик должен будет ввести один из этих ответов.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm text-gray-400">
                                        Пояснение к ответу
                                    </label>

                                    <textarea
                                        value={explanation}
                                        onChange={e => setExplanation(e.target.value)}
                                        rows={3}
                                        placeholder="Почему этот ответ правильный?"
                                        className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
                                >
                                    {isSaving
                                        ? 'Сохранение...'
                                        : editingId
                                            ? 'Сохранить изменения'
                                            : 'Добавить вопрос'}
                                </button>
                            </form>
                        </div>

                        {/* Questions list */}
                        <div>
                            <h2 className="mb-4 text-xl font-bold">
                                Вопросы теста
                            </h2>

                            {questions.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                                    <p className="text-gray-400">
                                        Пока нет вопросов
                                    </p>

                                    <p className="mt-2 text-sm text-gray-600">
                                        Добавь первый вопрос с помощью редактора.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {questions.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`rounded-xl border p-5 transition ${
                                                editingId === item.id
                                                    ? 'border-violet-500/50 bg-violet-500/5'
                                                    : 'border-white/10 bg-[#12121c]'
                                            }`}
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-xs font-medium text-violet-400">
                                                    Вопрос {index + 1}
                                                </span>

                                                <span className="text-xs text-gray-500">
                                                    {item.type === 'SINGLE_CHOICE'
                                                        ? 'Один ответ'
                                                        : item.type === 'MULTIPLE_CHOICE'
                                                            ? 'Несколько ответов'
                                                            : 'Текст'}
                                                </span>
                                            </div>

                                            <p className="mb-4 font-medium">
                                                {item.question}
                                            </p>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => editQuestion(item)}
                                                    className="text-sm text-violet-400 hover:text-violet-300"
                                                >
                                                    Изменить
                                                </button>

                                                <button
                                                    onClick={() => deleteQuestion(item.id)}
                                                    className="text-sm text-red-400 hover:text-red-300"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}

export default TestEditorPage
