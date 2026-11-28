
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface MarkdownPreviewProps {
    content: string
}

function MarkdownPreview({ content }: MarkdownPreviewProps) {
    return (
        <div className="markdown-preview">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

export default MarkdownPreview
