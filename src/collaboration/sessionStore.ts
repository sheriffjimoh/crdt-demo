import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

import { SHARED_TEXT_KEY, WS_SERVER_URL } from './constants'
import type { RoomSession } from './types'

const sessions = new Map<string, RoomSession>()

export function getSession(roomId: string): RoomSession {
  const existing = sessions.get(roomId)
  if (existing) {
    existing.refCount += 1
    return existing
  }

  const ydoc = new Y.Doc()
  const yText = ydoc.getText(SHARED_TEXT_KEY)
  const provider = new WebsocketProvider(WS_SERVER_URL, roomId, ydoc)

  const session: RoomSession = { ydoc, provider, yText, refCount: 1 }
  sessions.set(roomId, session)
  return session
}

export function releaseSession(roomId: string): void {
  const session = sessions.get(roomId)
  if (!session) return

  session.refCount -= 1
  if (session.refCount > 0) return

  session.provider.disconnect()
  session.provider.destroy()
  session.ydoc.destroy()
  sessions.delete(roomId)
}
