import { nanoid } from 'nanoid'
import { redirect } from 'next/navigation'

export default function Home() {
  // Generate a short unique room ID (e.g. "V1StGXR8")
  // and redirect immediately to that room
  const roomId = nanoid(8)
  redirect(`/room/${roomId}`)
}