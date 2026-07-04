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
        <p className="text-gray-400 italic text-sm">
          Preview will appear here as you type...
        </p>
      ) : (
        <div
          className="text-gray-800 text-sm leading-relaxed"
          style={{ maxWidth: '100%' }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-gray-900 mt-6">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 text-gray-900 mt-4">{children}</h3>,
              p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">{children}</ol>,
              li: ({ children }) => <li className="text-gray-700">{children}</li>,
              strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
              em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
              code: ({ children, className }) => {
                const isBlock = className?.includes('language-')
                return isBlock
                  ? <pre className="bg-gray-100 rounded-md p-4 overflow-auto mb-4 text-sm font-mono"><code>{children}</code></pre>
                  : <code className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
              },
              blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-300 pl-4 italic text-gray-600 mb-4">{children}</blockquote>,
              a: ({ href, children }) => <a href={href} className="text-indigo-600 underline hover:text-indigo-800">{children}</a>,
              hr: () => <hr className="my-6 border-gray-200" />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}