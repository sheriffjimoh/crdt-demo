'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
}

export default function MarkdownPreview({ content }: Props) {
  return (
    <div className="h-full overflow-auto p-6 bg-white">
      {content.trim() === '' ? (
        // Show a helpful placeholder when the document is empty
        <p className="text-gray-400 italic text-sm">
          Preview will appear here as you type markdown on the left...
        </p>
      ) : (
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}