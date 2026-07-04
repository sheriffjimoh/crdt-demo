'use client'

import { useEffect, useRef, useState } from 'react'
import { STATUS_CONFIG } from '@/src/collaboration/constants'
import { createRandomIdentity } from '@/src/collaboration/identity'
import { getSession, releaseSession } from '@/src/collaboration/sessionStore'
import { applyTextDiff } from '@/src/collaboration/textDiff'
import type { ConnectedUser, ConnectionStatus, RoomSession } from '@/src/collaboration/types'

interface AwarenessState {
  user?: ConnectedUser
}

interface Props {
  roomId: string
  onContentChange: (content: string) => void
}

export default function CollaborativeEditor({ roomId, onContentChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isRemoteChange = useRef(false)
  const onContentChangeRef = useRef(onContentChange)
  const sessionRef = useRef<RoomSession | null>(null)
  const identityRef = useRef(createRandomIdentity())

  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => {
    onContentChangeRef.current = onContentChange
  }, [onContentChange])

  useEffect(() => {
    if (!textareaRef.current) return

    const session = getSession(roomId)
    sessionRef.current = session
    const { provider, yText } = session

    const handleStatus = (event: { status: string }) => {
      setStatus(event.status as ConnectionStatus)
    }
    provider.on('status', handleStatus)

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values()) as AwarenessState[]
      const users = states
        .filter((s) => s?.user)
        .map((s) => s.user as ConnectedUser)
      setConnectedUsers(users)
    }
    provider.awareness.on('change', updateUsers)

    provider.awareness.setLocalStateField('user', {
      name: identityRef.current.name,
      color: identityRef.current.color,
    })

    const observer = () => {
      const textarea = textareaRef.current
      const content = yText.toString()

      if (textarea) {
        if (textarea.value !== content) {
          const selStart = textarea.selectionStart
          const selEnd = textarea.selectionEnd
          isRemoteChange.current = true
          textarea.value = content
          isRemoteChange.current = false
          textarea.setSelectionRange(selStart, selEnd)
        }
      }

      onContentChangeRef.current(content)
    }
    yText.observe(observer)

    const handleSync = (isSynced: boolean) => {
      if (isSynced && textareaRef.current) {
        const content = yText.toString()
        textareaRef.current.value = content
        onContentChangeRef.current(content)
        console.log('[sync] Loaded document, length:', content.length)
      }
    }
    provider.on('sync', handleSync)

    if (provider.synced && textareaRef.current) {
      const content = yText.toString()
      textareaRef.current.value = content
      onContentChangeRef.current(content)
    }

    return () => {
      yText.unobserve(observer)
      provider.off('status', handleStatus)
      provider.off('sync', handleSync)
      provider.awareness.off('change', updateUsers)
      releaseSession(roomId)
    }
  }, [roomId])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isRemoteChange.current) return

    const session = sessionRef.current
    if (!session) return

    applyTextDiff(session.ydoc, session.yText, e.target.value)
  }

  const statusConfig = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
          <span className="text-xs text-gray-400">{statusConfig.label}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">In room:</span>
          {connectedUsers.map((user, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
              style={{ backgroundColor: user.color + 'bb' }}
            >
              {user.name}
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 py-1 bg-gray-950 text-xs text-gray-500 font-mono shrink-0">
        Room: {roomId} | Synced: {status === 'connected' ? 'yes' : 'no'} | Users: {connectedUsers.length}
      </div>

      <textarea
        ref={textareaRef}
        onChange={handleInput}
        placeholder={`# Start typing here...\n\nShare the URL with someone to collaborate.\n\n## Markdown works\n- **Bold**, *italic*, \`code\`\n- [Links](https://example.com)`}
        spellCheck={false}
        className="flex-1 w-full resize-none bg-gray-900 text-gray-100
          text-sm font-mono leading-relaxed p-6 outline-none border-none
          placeholder-gray-600"
      />
    </div>
  )
}