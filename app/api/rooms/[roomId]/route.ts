import { getRoom, touchRoom } from '@/src/rooms/store'

interface RouteParams {
  roomId: string
}

interface TouchRoomPayload {
  fallbackName?: string
}

export async function GET(_request: Request, { params }: { params: Promise<RouteParams> }) {
  const { roomId } = await params
  const room = await getRoom(roomId)

  if (!room) {
    return Response.json({ error: 'Room not found.' }, { status: 404 })
  }

  return Response.json({ room })
}

export async function PATCH(request: Request, { params }: { params: Promise<RouteParams> }) {
  const { roomId } = await params
  const payload = (await request.json().catch(() => ({}))) as TouchRoomPayload
  const room = await touchRoom(roomId, payload.fallbackName)

  return Response.json({ room })
}
