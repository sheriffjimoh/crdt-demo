'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

interface RoomRecord {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

function formatTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

export default function RoomDashboard() {
  const router = useRouter()

  const [rooms, setRooms] = useState<RoomRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const [roomName, setRoomName] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')

  const canCreate = useMemo(() => roomName.trim().length >= 2, [roomName])
  const canJoin = useMemo(() => joinRoomId.trim().length > 0, [joinRoomId])

  useEffect(() => {
    let isMounted = true

    const loadRooms = async () => {
      try {
        const response = await fetch('/api/rooms', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load rooms')
        }

        const data = (await response.json()) as { rooms: RoomRecord[] }
        if (isMounted) {
          setRooms(data.rooms)
        }
      } catch {
        if (isMounted) {
          setError('Could not load room list.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadRooms()

    return () => {
      isMounted = false
    }
  }, [])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canCreate || creating) return

    setCreating(true)
    setError('')

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: roomName.trim() }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || 'Could not create room')
      }

      const data = (await response.json()) as { room: RoomRecord }
      setRooms((previous) => [data.room, ...previous])
      setRoomName('')
      router.push(`/room/${data.room.id}`)
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : 'Could not create room'
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canJoin) return
    router.push(`/room/${joinRoomId.trim()}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">CollabNotes</h1>
          <p className="mt-2 text-sm text-slate-400">
            Create named rooms, revisit previous sessions, or join an existing room by ID.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-medium text-slate-100">Create a room</h2>
            <form className="mt-4 flex gap-3" onSubmit={handleCreate}>
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="e.g. Sprint Planning"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-indigo-500/50 transition focus:ring-2"
                maxLength={80}
              />
              <button
                type="submit"
                disabled={!canCreate || creating}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-medium text-slate-100">Join by room ID</h2>
            <form className="mt-4 flex gap-3" onSubmit={handleJoin}>
              <input
                value={joinRoomId}
                onChange={(event) => setJoinRoomId(event.target.value)}
                placeholder="Enter room ID"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-indigo-500/50 transition focus:ring-2"
              />
              <button
                type="submit"
                disabled={!canJoin}
                className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium transition hover:border-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Open
              </button>
            </form>
          </section>
        </div>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-5 py-3">
            <h2 className="text-base font-medium">Recent rooms</h2>
          </div>

          {loading ? (
            <p className="px-5 py-6 text-sm text-slate-400">Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">No rooms yet. Create your first room above.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {rooms.map((room) => (
                <li key={room.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">{room.name}</p>
                    <p className="mt-1 text-xs text-slate-500">ID: {room.id}</p>
                    <p className="mt-1 text-xs text-slate-500">Updated: {formatTime(room.updatedAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/room/${room.id}`)}
                    className="shrink-0 rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium transition hover:border-slate-400"
                  >
                    Open room
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
      </div>
    </div>
  )
}
