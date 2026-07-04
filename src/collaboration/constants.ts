import type { ConnectionStatus } from './types'

export const WS_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:1234'
export const SHARED_TEXT_KEY = 'content'

export const USER_COLORS = [
  '#F87171', '#FB923C', '#FBBF24',
  '#34D399', '#60A5FA', '#A78BFA', '#F472B6',
]

export const ADJECTIVES = ['Swift', 'Calm', 'Bold', 'Wise', 'Kind', 'Cool', 'Brave']
export const NOUNS = ['Tiger', 'Eagle', 'Panda', 'Falcon', 'Wolf', 'Shark', 'Lion']

export const STATUS_CONFIG: Record<ConnectionStatus, { color: string; label: string }> = {
  connecting: { color: 'bg-yellow-400', label: 'Connecting...' },
  connected: { color: 'bg-green-400', label: 'Connected' },
  disconnected: { color: 'bg-red-400', label: 'Disconnected' },
}
