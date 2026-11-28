
import { useRef, useState } from 'react'
import MarkdownPreview from './MarkdownPreview'

type EditorMode = 'edit' | 'preview' | 'split'

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    minHeight?: number
}

function MarkdownEditor({
                            value,
                            onChange,
                            placeholder = 'Начни писать материал...',
                            minHeight = 500,
                        }: MarkdownEditorProps) {
    const [mode, setMode] = useState<EditorMode>('split')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    function insertText(before: string, after = '', defaultText = 'текст') {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const text = selectedText || defaultText

        const replacement = before + text + after

        onChange(
            value.substring(0, start) +
            replacement +
            value.substring(end)
        )

        requestAnimationFrame(() => {
            textarea.focus()

            if (selectedText) {
                const cursor = start + replacement.length
                textarea.setSelectionRange(cursor, cursor)
            } else {
                textarea.setSelectionRange(
                    start + before.length,
                    start + before.length + text.length
                )
            }
        })
    }

    function insertLine(prefix: string) {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const lineStart = value.lastIndexOf('\n', start - 1) + 1

        onChange(
            value.substring(0, lineStart) +
            prefix +
            value.substring(lineStart)
        )

        requestAnimationFrame(() => {
            textarea.focus()
            textarea.setSelectionRange(
                start + prefix.length,
                start + prefix.length
            )
        })
    }

    function insertBlock(text: string) {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        const prefix = start > 0 && value[start - 1] !== '\n' ? '\n\n' : ''
        const suffix = end < value.length && value[end] !== '\n' ? '\n\n' : ''

        const replacement = prefix + text + suffix

        onChange(
            value.substring(0, start) +
            replacement +
            value.substring(end)
        )

        requestAnimationFrame(() => {
            textarea.focus()
            const cursor = start + replacement.length
            textarea.setSelectionRange(cursor, cursor)
        })
    }

    const toolbarButton =
        'rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white'

    const modeButton = (selected: boolean) =>
        `rounded-lg px-3 py-2 text-xs font-medium transition ${
            selected
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#12121c] shadow-xl shadow-black/10">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">

                <div>
                    <h2 className="font-semibold text-white">
                        Редактор материала
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                        Markdown · LaTeX · Математические формулы
                    </p>
                </div>

                <div className="flex rounded-xl border border-white/5 bg-[#0b0b12] p-1">
                    <button
                        type="button"
                        onClick={() => setMode('edit')}
                        className={modeButton(mode === 'edit')}
                    >
                        Редактор
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('split')}
                        className={modeButton(mode === 'split')}
                    >
                        Разделить
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('preview')}
                        className={modeButton(mode === 'preview')}
                    >
                        Просмотр
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            {mode !== 'preview' && (
                <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-[#151522] px-4 py-3">

                    <button type="button" onClick={() => insertLine('# ')} className={toolbarButton}>
                        H1
                    </button>

                    <button type="button" onClick={() => insertLine('## ')} className={toolbarButton}>
                        H2
                    </button>

                    <button type="button" onClick={() => insertLine('### ')} className={toolbarButton}>
                        H3
                    </button>

                    <div className="mx-2 h-6 w-px bg-white/10" />

                    <button type="button" onClick={() => insertText('**', '**')} className={toolbarButton}>
                        <strong>B</strong>
                    </button>

                    <button type="button" onClick={() => insertText('*', '*')} className={toolbarButton}>
                        <i>I</i>
                    </button>

                    <button type="button" onClick={() => insertText('~~', '~~')} className={toolbarButton}>
                        <s>S</s>
                    </button>

                    <div className="mx-2 h-6 w-px bg-white/10" />

                    <button type="button" onClick={() => insertLine('- ')} className={toolbarButton}>
                        • Список
                    </button>

                    <button type="button" onClick={() => insertLine('1. ')} className={toolbarButton}>
                        1. Список
                    </button>

                    <button type="button" onClick={() => insertLine('> ')} className={toolbarButton}>
                        ❝
                    </button>

                    <div className="mx-2 h-6 w-px bg-white/10" />

                    <button type="button" onClick={() => insertText('`', '`', 'code')} className={toolbarButton}>
                        {'</>'}
                    </button>

                    <button
                        type="button"
                        onClick={() => insertBlock('```python\nprint("Hello, world!")\n```')}
                        className={toolbarButton}
                    >
                        Код
                    </button>

                    <button
                        type="button"
                        onClick={() => insertText('[', '](https://example.com)', 'ссылка')}
                        className={toolbarButton}
                    >
                        Ссылка
                    </button>

                    <div className="mx-2 h-6 w-px bg-white/10" />

                    <button
                        type="button"
                        onClick={() => insertText('$', '$', 'x^2')}
                        className={toolbarButton}
                    >
                        x²
                    </button>

                    <button
                        type="button"
                        onClick={() => insertBlock('$$\n\\frac{a}{b}\n$$')}
                        className={toolbarButton}
                    >
                        ∑ Формула
                    </button>
                </div>
            )}

            {/* Workspace */}
            <div
                className={`grid ${
                    mode === 'split'
                        ? 'grid-cols-1 lg:grid-cols-2'
                        : 'grid-cols-1'
                }`}
                style={{ minHeight }}
            >

                {/* Editor */}
                {mode !== 'preview' && (
                    <section className="flex min-h-0 min-w-0 flex-col border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">

                        <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/5 bg-[#151522] px-5">
                            <span className="text-xs font-semibold tracking-wider text-gray-400">
                                MARKDOWN
                            </span>

                            <span className="text-xs text-gray-600">
                                Исходный текст
                            </span>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            placeholder={placeholder}
                            spellCheck={false}
                            className="min-h-[500px] w-full flex-1 resize-none bg-transparent p-6 font-mono text-sm leading-7 text-gray-200 outline-none placeholder:text-gray-600"
                        />
                    </section>
                )}

                {/* Preview */}
                {mode !== 'edit' && (
                    <section className="flex min-h-0 min-w-0 flex-col">

                        <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/5 bg-[#151522] px-5">
                            <span className="text-xs font-semibold tracking-wider text-gray-400">
                                ПРЕДПРОСМОТР
                            </span>

                            <span className="text-xs text-gray-600">
                                Результат
                            </span>
                        </div>

                        <div className="min-h-[500px] flex-1 overflow-y-auto p-6">
                            {value.trim() ? (
                                <MarkdownPreview content={value} />
                            ) : (
                                <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-600">
                                    Здесь появится предпросмотр материала
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 bg-[#151522] px-5 py-3 text-xs text-gray-500">
                <span>Markdown · KaTeX</span>
                <span>{value.length} символов</span>
            </div>
        </div>
    )
}

export default MarkdownEditor
