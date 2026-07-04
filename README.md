# CollabNotes CRDT Demo

A real-time collaborative Markdown editor built with Next.js + Yjs.

Multiple users can open the same room URL and edit one shared document at the same time. Updates are merged using CRDTs, so changes sync live without one user overwriting another.

## What This Project Does

- Creates a unique room URL and redirects users into that room.
- Connects each room to a shared Yjs document over WebSocket.
- Syncs text changes in real time between all connected users.
- Shows room members (awareness/presence).
- Renders a live Markdown preview beside the editor.

## What You Can Learn From It

- How CRDT-based collaboration works at a practical level.
- How Yjs models shared text and resolves concurrent edits.
- How to separate UI concerns from collaboration domain logic.
- How presence (awareness) differs from document data sync.
- How to run a Next.js frontend and collaboration server together.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Yjs
- y-websocket
- ws (WebSocket server)
- react-markdown + remark-gfm

## Project Structure

```text
app/
	components/
		CollaborativeEditor.tsx   # editor UI + orchestration
		MarkdownPreview.tsx       # markdown preview UI
	room/[roomId]/page.tsx      # room experience

server/
	ws-server.js                # websocket sync server

src/
	collaboration/
		constants.ts              # shared collaboration config
		identity.ts               # user color/name generation
		sessionStore.ts           # room-scoped ydoc/provider lifecycle
		textDiff.ts               # minimal text diff + Yjs apply
		types.ts                  # collaboration types
	markdown/
		renderers.tsx             # markdown renderer map
```

## Prerequisites

- Node.js 18+ (20 LTS recommended)
- npm 9+

## Installation

```bash
npm install
```

## Run Locally

You need two terminals.

1. Start the collaboration server:

```bash
npm run server
```

2. Start the Next.js app:

```bash
npm run dev
```

3. Open the app:

```text
http://localhost:3000
```

4. Test collaboration:

- Open the same room URL in two browser windows.
- Type in one window and confirm the other updates instantly.

## Scripts

- `npm run dev` - start Next.js dev server
- `npm run server` - start y-websocket sync server on port 1234
- `npm run build` - production build
- `npm run start` - run production app
- `npm run lint` - run ESLint

## Environment

Optional:

- `NEXT_PUBLIC_WS_URL` - override websocket server URL (default: `ws://localhost:1234`)

Example:

```bash
NEXT_PUBLIC_WS_URL=ws://localhost:1234 npm run dev
```

## Notes

- Current setup is in-memory sync server (no persistence yet).
- If the server restarts, room document state resets.
- Presence and document content are synchronized over the same websocket provider.

## Next Milestones

1. Persistence (LevelDB)
2. Live cursors
3. Room list + named rooms
4. Deployment (frontend + websocket server)
