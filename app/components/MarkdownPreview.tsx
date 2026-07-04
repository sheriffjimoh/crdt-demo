'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { markdownRenderers } from '@/src/markdown/renderers'

interface Props {
  content: string
}

export default function MarkdownPreview({ content }: Props) {
  return (
    <div className="h-full overflow-auto p-6 bg-white">
      {content.trim() === '' ? (
        <p className="text-gray-400 italic text-sm">
          Preview will appear here as you type...
        </p>
      ) : (
        <div
          className="text-gray-800 text-sm leading-relaxed"
          style={{ maxWidth: '100%' }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownRenderers}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}