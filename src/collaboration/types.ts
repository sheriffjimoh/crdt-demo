import type * as Y from 'yjs'
import type { WebsocketProvider } from 'y-websocket'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export interface ConnectedUser {
  name: string
  color: string
}

export interface UserIdentity {
  name: string
  color: string
}

export interface RoomSession {
  ydoc: Y.Doc
  provider: WebsocketProvider
  yText: Y.Text
  refCount: number
}
