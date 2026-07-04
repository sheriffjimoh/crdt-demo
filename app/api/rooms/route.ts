import { createRoom, listRooms } from '@/src/rooms/store'

interface CreateRoomPayload {
  name?: string
}

export async function GET() {
  const rooms = await listRooms()
  return Response.json({ rooms })
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as CreateRoomPayload
  const name = payload.name?.trim() ?? ''

  if (name.length < 2 || name.length > 80) {
    return Response.json(
      { error: 'Room name must be between 2 and 80 characters.' },
      { status: 400 },
    )
  }

  const room = await createRoom(name)
  return Response.json({ room }, { status: 201 })
}
