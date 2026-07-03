const WebSocket = require('ws')
const http = require('http')
const { setupWSConnection } = require('y-websocket/bin/utils')

// Create a basic HTTP server (required to attach WebSocket to)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Collaborative notes WebSocket server is running.\n')
})

// Attach a WebSocket server on top of the HTTP server
const wss = new WebSocket.Server({ server })

// Every time a client connects, hand it off to y-websocket's handler
// setupWSConnection does all the heavy lifting:
// - tracks which document (room) each client is in
// - syncs document state between clients
// - handles awareness (cursor positions, user info)
wss.on('connection', (ws, req) => {
  console.log('Client connected')
  setupWSConnection(ws, req)
})

wss.on('close', () => {
  console.log('Client disconnected')
})

const PORT = 1234
server.listen(PORT, () => {
  console.log(`✅ WebSocket server running on ws://localhost:${PORT}`)
})