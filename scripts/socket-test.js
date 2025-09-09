// socket-test.js
// Usage:
//   BASE_URL=http://localhost:5000 USER_ID=<mongoId> CONV_ID=<optional> node socket-test.js
//
// Notes:
// - If server CORS restricts origins, set ORIGIN=http://localhost:5173 (as in your server.ts).
// - Open two terminals with different USER_IDs to simulate two users.
const { io } = require('socket.io-client');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000'; // your server base (no /socket.io path)
const USER_ID  = process.env.USER_ID; // required
const CONV_ID  = process.env.CONV_ID; // optional: auto-join a conversation room
const ORIGIN   = process.env.ORIGIN   || 'http://localhost:5173';

if (!USER_ID) {
  console.error('Missing USER_ID env. Example: USER_ID=6650... node socket-test.js');
  process.exit(1);
}

const socket = io(BASE_URL, {
  transports: ['websocket', 'polling'],
  extraHeaders: { Origin: ORIGIN },
});

socket.on('connect', () => {
  console.log('[io] connected as', socket.id);
  socket.emit('user:join', { userId: USER_ID });
  if (CONV_ID) {
    socket.emit('conv:join', { convId: CONV_ID });
    console.log('[io] joined conv room', CONV_ID);
  }
});

// Legacy notification channel from your notificationsHelper
socket.on(`get-notification::${USER_ID}`, (payload) => {
  console.log('[notif:legacy]', payload);
});

// New generic notification
socket.on('notif:new', (payload) => {
  console.log('[notif:new]', payload);
});

// Match events
socket.on('match:new', (payload) => {
  console.log('[match:new]', payload);
});

socket.on('like:inbound', (payload) => {
  console.log('[like:inbound]', payload);
});

// Chat events
socket.on('chat:state', (payload) => {
  console.log('[chat:state]', payload);
});

socket.on('chat:message', (payload) => {
  console.log('[chat:message]', payload);
});

socket.on('chat:archived', (payload) => {
  console.log('[chat:archived]', payload);
});

socket.on('disconnect', () => console.log('[io] disconnect'));
