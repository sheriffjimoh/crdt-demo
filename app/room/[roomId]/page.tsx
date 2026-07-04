'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import CollaborativeEditor from '../../components/CollaborativeEditor'
import MarkdownPreview from '../../components/MarkdownPreview'

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const [markdownContent, setMarkdownContent] = useState('')
  const [copied, setCopied] = useState(false)

  const handleContentChange = useCallback((content: string) => {
    setMarkdownContent(content)
  }, [])

  const roomUrl = typeof window !== 'undefined'
    ? window.location.href
    : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white tracking-tight">
            📝 CollabNotes
          </span>
          <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded">
            Room: {roomId}
          </span>
        </div>

        <button
          onClick={copyLink}
          className="text-sm px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          {copied ? '✅ Copied!' : '🔗 Copy room link'}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-gray-700 overflow-hidden flex flex-col">
          <div className="px-4 py-1.5 text-xs text-gray-500 bg-gray-800 border-b border-gray-700">
            ✏️ Markdown Editor
          </div>
          <div className="flex-1 overflow-hidden">
            <CollaborativeEditor
              roomId={roomId}
              onContentChange={handleContentChange}
            />
          </div>
        </div>

        <div className="w-1/2 overflow-hidden flex flex-col">
          <div className="px-4 py-1.5 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
            👁️ Live Preview
          </div>
          <div className="flex-1 overflow-hidden">
            <MarkdownPreview content={markdownContent} />
          </div>
        </div>
      </div>
    </div>
  )
}