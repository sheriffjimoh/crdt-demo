'use client'

import { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const USER_COLORS = [
  '#F87171', '#FB923C', '#FBBF24',
  '#34D399', '#60A5FA', '#A78BFA', '#F472B6'
]

const ADJECTIVES = ['Swift', 'Calm', 'Bold', 'Wise', 'Kind', 'Cool', 'Brave']
const NOUNS = ['Tiger', 'Eagle', 'Panda', 'Falcon', 'Wolf', 'Shark', 'Lion']

function randomItem<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface Props {
  roomId: string
  onContentChange: (content: string) => void
}

export default function CollaborativeEditor({ roomId, onContentChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const ydocRef = useRef<Y.Doc | null>(null)
  const yTextRef = useRef<Y.Text | null>(null)
  const isRemoteChange = useRef(false)

  const [connectedUsers, setConnectedUsers] = useState<{ name: string; color: string }[]>([])
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const userName = useRef(`${randomItem(ADJECTIVES)} ${randomItem(NOUNS)}`)
  const userColor = useRef(randomItem(USER_COLORS))

  useEffect(() => {
    if (!textareaRef.current) return

    // --- 1. Create Yjs document and shared text ---
    const ydoc = new Y.Doc()
    const yText = ydoc.getText('content')
    ydocRef.current = ydoc
    yTextRef.current = yText

    // --- 2. Connect to WebSocket server ---
    const provider = new WebsocketProvider(
      'ws://localhost:1234',
      roomId,
      ydoc
    )

    // --- 3. Track connection status ---
    provider.on('status', (event: { status: string }) => {
      setStatus(event.status as any)
    })

    // --- 4. Set awareness (who I am) ---
    provider.awareness.setLocalStateField('user', {
      name: userName.current,
      color: userColor.current,
    })

    // --- 5. Watch for other users joining/leaving ---
    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values()) as any[]
      const users = states
        .filter((s) => s?.user)
        .map((s) => ({ name: s.user.name, color: s.user.color }))
      setConnectedUsers(users)
    }
    provider.awareness.on('change', updateUsers)

    // --- 6. The critical part: watch yText for ANY change ---
    // This fires when YOU type AND when a REMOTE user types
    yText.observe(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      const content = yText.toString()

      // Save cursor position before we update the textarea value
      // so the cursor doesn't jump to the end on every keystroke
      const selStart = textarea.selectionStart
      const selEnd = textarea.selectionEnd

      // Flag that this update came from Yjs so our input handler ignores it
      isRemoteChange.current = true
      textarea.value = content
      isRemoteChange.current = false

      // Restore cursor position
      textarea.setSelectionRange(selStart, selEnd)

      // Push content up to the parent for the preview panel
      onContentChange(content)
    })

    // --- 7. Once synced, load existing document content ---
    // Important for users who join a room that already has content
    provider.on('sync', (synced: boolean) => {
      if (synced) {
        const content = yText.toString()
        if (textareaRef.current) {
          textareaRef.current.value = content
        }
        onContentChange(content)
      }
    })

    return () => {
      provider.awareness.off('change', updateUsers)
      provider.disconnect()
      provider.destroy()
      ydoc.destroy()
    }
  }, [roomId])

  // --- When the user types, compute the CRDT diff and apply it ---
  // Instead of replacing the whole string (which breaks remote cursors),
  // we find exactly what changed and do a precise insert/delete
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isRemoteChange.current) return

    const yText = yTextRef.current
    const ydoc = ydocRef.current
    if (!yText || !ydoc) return

    const newValue = e.target.value
    const oldValue = yText.toString()

    // Find the start of the difference
    let start = 0
    while (
      start < oldValue.length &&
      start < newValue.length &&
      oldValue[start] === newValue[start]
    ) {
      start++
    }

    // Find the end of the difference (scanning from the right)
    let oldEnd = oldValue.length
    let newEnd = newValue.length
    while (
      oldEnd > start &&
      newEnd > start &&
      oldValue[oldEnd - 1] === newValue[newEnd - 1]
    ) {
      oldEnd--
      newEnd--
    }

    // Apply as a single Yjs transaction
    ydoc.transact(() => {
      if (oldEnd > start) {
        // Delete removed characters
        yText.delete(start, oldEnd - start)
      }
      if (newEnd > start) {
        // Insert new characters
        yText.insert(start, newValue.slice(start, newEnd))
      }
    })
  }

  const statusColor = {
    connecting: 'bg-yellow-400',
    connected: 'bg-green-400',
    disconnected: 'bg-red-400',
  }[status]

  return (
    <div className="flex flex-col h-full bg-gray-900">

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full animate-pulse ${statusColor}`} />
          <span className="text-xs text-gray-400 capitalize">{status}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {connectedUsers.map((user, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
              style={{ backgroundColor: user.color + '99' }}
            >
              {user.name}
            </span>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        onChange={handleInput}
        placeholder={`# Start typing markdown here...\n\nOpen this same URL in another browser to collaborate.\n\n## Example\n- **Bold**, *italic*\n- [Links](https://example.com)\n- \`code\``}
        spellCheck={false}
        className="flex-1 w-full resize-none bg-gray-900 text-gray-100 text-sm
          font-mono leading-relaxed p-6 outline-none border-none
          placeholder-gray-600"
      />
    </div>
  )
}