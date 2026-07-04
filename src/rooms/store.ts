import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { nanoid } from 'nanoid'

import type { RoomRecord } from './types'

const DATA_DIR = path.join(process.cwd(), '.rooms')
const DATA_FILE = path.join(DATA_DIR, 'rooms.json')

interface RoomRegistry {
  rooms: RoomRecord[]
}

async function ensureStore(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })

  try {
    await readFile(DATA_FILE, 'utf8')
  } catch {
    await writeFile(DATA_FILE, JSON.stringify({ rooms: [] }, null, 2), 'utf8')
  }
}

async function readRegistry(): Promise<RoomRegistry> {
  await ensureStore()
  const raw = await readFile(DATA_FILE, 'utf8')

  try {
    const parsed = JSON.parse(raw) as RoomRegistry
    if (!Array.isArray(parsed.rooms)) {
      return { rooms: [] }
    }
    return parsed
  } catch {
    return { rooms: [] }
  }
}

async function writeRegistry(registry: RoomRegistry): Promise<void> {
  await ensureStore()
  await writeFile(DATA_FILE, JSON.stringify(registry, null, 2), 'utf8')
}

export async function listRooms(): Promise<RoomRecord[]> {
  const registry = await readRegistry()
  return registry.rooms
    .slice()
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
}

export async function getRoom(roomId: string): Promise<RoomRecord | null> {
  const registry = await readRegistry()
  return registry.rooms.find((room) => room.id === roomId) ?? null
}

export async function createRoom(name: string): Promise<RoomRecord> {
  const registry = await readRegistry()
  const now = new Date().toISOString()

  const room: RoomRecord = {
    id: nanoid(8),
    name,
    createdAt: now,
    updatedAt: now,
  }

  registry.rooms.push(room)
  await writeRegistry(registry)

  return room
}

export async function touchRoom(roomId: string, fallbackName?: string): Promise<RoomRecord> {
  const registry = await readRegistry()
  const existing = registry.rooms.find((room) => room.id === roomId)
  const now = new Date().toISOString()

  if (existing) {
    existing.updatedAt = now
    await writeRegistry(registry)
    return existing
  }

  const room: RoomRecord = {
    id: roomId,
    name: fallbackName?.trim() || `Room ${roomId}`,
    createdAt: now,
    updatedAt: now,
  }

  registry.rooms.push(room)
  await writeRegistry(registry)
  return room
}
