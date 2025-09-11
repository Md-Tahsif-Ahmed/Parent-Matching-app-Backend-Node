// socket-rt-test.js
// Usage: node socket-rt-test.js http://localhost:5001 JWT_A USER_ID_A JWT_B USER_ID_B
const { io } = require('socket.io-client');

const URL      = process.argv[2] || 'http://localhost:5001';
const TOKEN_A  = process.argv[3] || process.env.TOKEN_A || '';
const USER_A   = process.argv[4] || process.env.USER_A || '';
const TOKEN_B  = process.argv[5] || process.env.TOKEN_B || '';
const USER_B   = process.argv[6] || process.env.USER_B || '';

function make(label, token, userId){
  const socket = io(URL, {
    transports: ['websocket'],
    auth: { token },                                      // socket.handshake.auth.token
    extraHeaders: { Authorization: `Bearer ${token}` },   // Authorization: Bearer <JWT>
    query: { userId }                                     // if you read query too
  });

  socket.on('connect', () => {
    console.log(`[${label}] connected ${socket.id}`);
    // === IMPORTANT: join your user room ===
    socket.emit('user:join', { userId });
  });

  socket.on('connect_error', (err) => console.error(`[${label}] connect_error:`, err.message));

  // ---- Realtime listeners (server -> client) ----
  socket.on('like:inbound',  (p) => console.log(`[${label}] like:inbound`, p));
  socket.on('match:new',     (p) => console.log(`[${label}] match:new`, p));
  socket.on('notif:new',     (n) => console.log(`[${label}] notif:new`, n));

  // legacy fallback (server emits: get-notification::<userId>)
  socket.on(`get-notification::${userId}`, (n) => console.log(`[${label}] legacy notif`, n));

  // optional: chat state
  socket.on('chat:state', (x) => console.log(`[${label}] chat:state`, x));

  return socket;
}

const a = make('A', TOKEN_A, USER_A);
const b = make('B', TOKEN_B, USER_B);

// Helper: trigger HTTP like from A -> B (Node 18+ has global fetch)
async function triggerLike() {
  const res = await fetch(`${URL}/api/v1/match/like/${USER_B}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN_A}` }
  });
  const json = await res.json().catch(()=>({}));
  console.log(`[HTTP] POST /match/like/${USER_B} ->`, res.status, json);
}

// Wait until both sockets connected & joined, then call like
let ready = { A:false, B:false };
function markReady(label){
  ready[label] = true;
  // if (ready.A && ready.B) setTimeout(triggerLike, 800); // tiny delay after join
}
a.on('connect', ()=>markReady('A'));
b.on('connect', ()=>markReady('B'));

// Graceful exit
process.on('SIGINT', ()=> { a.close(); b.close(); process.exit(0); });
