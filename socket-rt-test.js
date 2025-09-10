// socket-rt-test.js
// Usage: node socket-rt-test.js http://localhost:5001/api/v1 JWT_A USER_ID_A JWT_B USER_ID_B
// Requires: npm i socket.io-client
const { io } = require('socket.io-client');

const URL      = process.argv[2] || 'http://localhost:5001';
const TOKEN_A  = process.argv[3] || process.env.TOKEN_A || '';
const USER_A   = process.argv[4] || process.env.USER_A || '';
const TOKEN_B  = process.argv[5] || process.env.TOKEN_B || '';
const USER_B   = process.argv[6] || process.env.USER_B || '';

function make(label, token, userId){
  const socket = io(URL, {
    transports: ['websocket'],
    auth: { token },                    // if server reads from socket.handshake.auth.token
    extraHeaders: { Authorization: `Bearer ${token}` }, // if server checks Authorization header
    query: { userId }                   // if server expects query param
  });

  socket.on('connect', () => {
    console.log(`[${label}] connected ${socket.id}`);
    // join personal room if your server supports it
    socket.emit('join', { room: `user:${userId}` });
  });

  socket.on('connect_error', (err) => console.error(`[${label}] connect_error:`, err.message));

  // Server -> Client events (adjust to your server)
  socket.on('notification', (n) => console.log(`[${label}] NOTIF`, n));
  socket.on('message',      (m) => console.log(`[${label}] MSG`, m));
  socket.on('capacity_full',(x) => console.log(`[${label}] CAPACITY_FULL`, x));

  return socket;
}

const a = make('A', TOKEN_A, USER_A);
const b = make('B', TOKEN_B, USER_B);

// Example flows (adjust event names to your server):
setTimeout(() => {
  console.log('A -> B: send_message');
  a.emit('send_message', { to: USER_B, text: 'Hi B, from A!' });
}, 1500);

setTimeout(() => {
  console.log('B -> A: send_message');
  b.emit('send_message', { to: USER_A, text: 'Hello A, got you.' });
}, 3500);

// Graceful exit
process.on('SIGINT', ()=> { a.close(); b.close(); process.exit(0); });
