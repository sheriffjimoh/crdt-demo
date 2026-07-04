'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import CollaborativeEditor from '../../components/CollaborativeEditor'
import MarkdownPreview from '../../components/MarkdownPreview'

interface RoomRecord {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const [markdownContent, setMarkdownContent] = useState('')
  const [copied, setCopied] = useState(false)
  const [roomName, setRoomName] = useState('')

  const handleContentChange = useCallback((content: string) => {
    setMarkdownContent(content)
  }, [])

  useEffect(() => {
    let isMounted = true

    const touchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fallbackName: `Room ${roomId}` }),
        })

        if (!response.ok) return
        const data = (await response.json()) as { room: RoomRecord }
        if (isMounted) {
          setRoomName(data.room.name)
        }
      } catch {
        // Keep the room page functional even if metadata request fails.
      }
    }

    touchRoom()

    return () => {
      isMounted = false
    }
  }, [roomId])

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
          {roomName ? (
            <span className="text-xs text-indigo-300 bg-indigo-950/60 px-2 py-1 rounded">
              {roomName}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-sm px-3 py-1.5 rounded-md border border-gray-600 hover:border-gray-400 transition-colors"
          >
            Rooms
          </Link>
          <button
            onClick={copyLink}
            className="text-sm px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            {copied ? '✅ Copied!' : '🔗 Copy room link'}
          </button>
        </div>
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