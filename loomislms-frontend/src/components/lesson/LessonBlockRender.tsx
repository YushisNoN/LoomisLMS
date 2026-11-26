
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import VideoPlayer from './VideoPlayer'
import { useAuthenticatedFile } from '../../hooks/useAuthenticatedFile'

interface LessonBlock {
    id: string
    type: 'TEXT' | 'VIDEO' | 'PRESENTATION' | 'IMAGE' | 'DIVIDER'
    content: string
    position: number
}

interface Props {
    blocks: LessonBlock[]
}

function PresentationViewer({ src }: { src: string }) {
    const { blobUrl, loading, error } = useAuthenticatedFile(src)

    if (loading) {
        return (
            <div className="flex h-[650px] items-center justify-center text-gray-400">
                Загружаем презентацию...
            </div>
        )
    }

    if (error || !blobUrl) {
        return (
            <div className="flex h-[650px] items-center justify-center text-red-400">
                {error || 'Не удалось открыть презентацию'}
            </div>
        )
    }

    return (
        <iframe
            src={blobUrl}
            title="Презентация к уроку"
            className="h-[650px] w-full bg-white"
        />
    )
}

function LessonBlockRenderer({ blocks }: Props) {
    return (
        <div className="space-y-8">
            {blocks.map(block => {
                switch (block.type) {
                    case 'TEXT':
                        return (
                            <article
                                key={block.id}
                                className="prose prose-invert max-w-none
                                prose-headings:font-bold
                                prose-headings:text-white
                                prose-p:text-gray-300
                                prose-p:leading-8
                                prose-strong:text-white
                                prose-a:text-violet-400
                                prose-li:text-gray-300
                                prose-blockquote:border-violet-500
                                prose-blockquote:text-gray-400
                                prose-hr:border-white/10
                                prose-th:text-white
                                prose-td:text-gray-300"
                            >
                                <ReactMarkdown
                                    remarkPlugins={[
                                        remarkGfm,
                                        remarkMath,
                                    ]}
                                    rehypePlugins={[
                                        rehypeKatex,
                                    ]}
                                    components={{
                                        pre: ({ children }) => (
                                            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#090910] p-5 text-sm leading-6">
                                                {children}
                                            </pre>
                                        ),
                                        code: ({ children, className }) => (
                                            <code
                                                className={`${className || ''} rounded bg-white/10 px-1.5 py-0.5 text-violet-300`}
                                            >
                                                {children}
                                            </code>
                                        ),
                                    }}
                                >
                                    {block.content}
                                </ReactMarkdown>
                            </article>
                        )

                    case 'VIDEO':
                        return (
                            <VideoPlayer
                                key={block.id}
                                src={block.content}
                            />
                        )

                    case 'PRESENTATION':
                        return (
                            <div
                                key={block.id}
                                className="overflow-hidden rounded-xl border border-white/10 bg-[#090910]"
                            >
                                <div className="border-b border-white/10 px-5 py-4">
                                    <p className="font-medium text-white">
                                        Презентация
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Просмотр внутри курса
                                    </p>
                                </div>

                                <PresentationViewer src={block.content} />
                            </div>
                        )

                    case 'IMAGE':
                        return (
                            <div
                                key={block.id}
                                className="overflow-hidden rounded-xl"
                            >
                                <img
                                    src={block.content}
                                    alt="Изображение к уроку"
                                    loading="lazy"
                                    className="mx-auto max-h-[650px] max-w-full rounded-xl object-contain"
                                />
                            </div>
                        )

                    case 'DIVIDER':
                        return (
                            <hr
                                key={block.id}
                                className="border-white/10"
                            />
                        )

                    default:
                        return null
                }
            })}
        </div>
    )
}

export default LessonBlockRenderer
