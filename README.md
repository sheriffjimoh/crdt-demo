# CollabNotes CRDT Demo

A real-time collaborative Markdown editor built with Next.js + Yjs.

Multiple users can open the same room URL and edit one shared document at the same time. Updates are merged using CRDTs, so changes sync live without one user overwriting another.

## What This Project Does

- Creates named rooms and keeps a persistent room list on the server.
- Lets users revisit rooms from a dashboard or join by room ID.
- Connects each room to a shared Yjs document over WebSocket.
- Syncs text changes in real time between all connected users.
- Shows room members (awareness/presence).
- Shows live remote cursors and selections in the editor.
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
	api/rooms/route.ts          # list/create named rooms
	api/rooms/[roomId]/route.ts # read/touch room metadata
	components/
		CollaborativeEditor.tsx   # editor UI + orchestration
		MarkdownPreview.tsx       # markdown preview UI
		RoomDashboard.tsx         # named-room landing page
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
	rooms/
		store.ts                  # file-backed room registry
		types.ts                  # room metadata types
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

4. Create or open a named room from the dashboard.

5. Test collaboration:

- Open the same room URL in two browser windows.
- Type in one window and confirm the other updates instantly.

## Scripts

- `npm run dev` - start Next.js dev server
- `npm run server` - start y-websocket sync server with LevelDB persistence on port 1234
- `npm run server:memory` - start y-websocket sync server without persistence
- `npm run build` - production build
- `npm run start` - run production app
- `npm run lint` - run ESLint

## Environment

Optional:

- `NEXT_PUBLIC_WS_URL` - override websocket server URL (default: `ws://localhost:1234`)
- `YPERSISTENCE` - persistence directory for y-websocket server (default in this repo: `./.yjs-db`)

Example:

```bash
NEXT_PUBLIC_WS_URL=ws://localhost:1234 npm run dev
```

## Notes

- Current default setup persists room state to `./.yjs-db` on the server machine.
- Room metadata (name + recency) is persisted separately at `./.rooms/rooms.json`.
- If the server restarts, room documents and room names are restored from disk.
- Presence and document content are synchronized over the same websocket provider.

## Next Milestones

1. Deployment (frontend + websocket server)
