'use client'

import { useEffect, useRef, useState } from 'react'
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, placeholder } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { yCollab } from 'y-codemirror.next'
import { STATUS_CONFIG } from '@/src/collaboration/constants'
import { createRandomIdentity } from '@/src/collaboration/identity'
import { getSession, releaseSession } from '@/src/collaboration/sessionStore'
import type { ConnectedUser, ConnectionStatus } from '@/src/collaboration/types'

interface AwarenessState {
  user?: ConnectedUser
}

interface Props {
  roomId: string
  onContentChange: (content: string) => void
}

export default function CollaborativeEditor({ roomId, onContentChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onContentChangeRef = useRef(onContentChange)
  const identityRef = useRef(createRandomIdentity())

  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => {
    onContentChangeRef.current = onContentChange
  }, [onContentChange])

  useEffect(() => {
    if (!editorRef.current) return

    const session = getSession(roomId)
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
    updateUsers()

    provider.awareness.setLocalStateField('user', {
      name: identityRef.current.name,
      color: identityRef.current.color,
      colorLight: identityRef.current.colorLight,
    })

    const state = EditorState.create({
      doc: yText.toString(),
      extensions: [
        basicSetup,
        markdown(),
        oneDark,
        EditorView.lineWrapping,
        placeholder('# Start typing here...'),
        yCollab(yText, provider.awareness),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })
    viewRef.current = view

    onContentChangeRef.current(yText.toString())

    const observer = () => {
      onContentChangeRef.current(yText.toString())
    }
    yText.observe(observer)

    const handleSync = (isSynced: boolean) => {
      if (isSynced) {
        const content = yText.toString()
        onContentChangeRef.current(content)
        console.log('[sync] Loaded document, length:', content.length)
      }
    }
    provider.on('sync', handleSync)

    if (provider.synced) {
      const content = yText.toString()
      onContentChangeRef.current(content)
    }

    return () => {
      view.destroy()
      viewRef.current = null
      yText.unobserve(observer)
      provider.off('status', handleStatus)
      provider.off('sync', handleSync)
      provider.awareness.off('change', updateUsers)
      releaseSession(roomId)
    }
  }, [roomId])

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

      <div className="flex-1 overflow-hidden bg-gray-900">
        <div
          ref={editorRef}
          className="h-full w-full text-sm"
        />
      </div>
    </div>
  )
}