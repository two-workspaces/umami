// wait:  block until Postgres accepts connections (up to 5 minutes).
// setup: once Umami is up, swap the seeded admin/umami password for
//        UMAMI_ADMIN_PASSWORD. Does nothing once the default no longer works.
const net = require('net');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(`[railway-setup] ${m}`);
const env = process.env;

async function wait() {
  const { hostname: host, port } = new URL(env.DATABASE_URL);
  for (let i = 0; i < 150; i++) {
    const ok = await new Promise((res) => {
      const s = net.connect({ host, port: +(port || 5432) }, () => { s.destroy(); res(true); });
      s.on('error', () => res(false));
      s.setTimeout(2000, () => { s.destroy(); res(false); });
    });
    if (ok) return;
    if (i % 10 === 0) log(`waiting for Postgres at ${host}`);
    await sleep(2000);
  }
  log('Postgres did not come up in 5 minutes, starting Umami anyway');
}

async function setup() {
  const pw = env.UMAMI_ADMIN_PASSWORD || '';
  if (pw.length < 8) return log('UMAMI_ADMIN_PASSWORD is shorter than 8 characters: sign in as admin/umami and change it now');
  const api = `http://127.0.0.1:${env.PORT || 3000}/api`;
  const post = (path, body, token) => fetch(api + path, { method: 'POST', body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) } });
  for (let i = 0; i < 300; i++) {
    try {
      if ((await fetch(`${api}/heartbeat`)).ok) break;
    } catch {}
    await sleep(2000);
  }
  const login = await post('/auth/login', { username: 'admin', password: 'umami' });
  if (login.status === 401) return log('default admin password already changed');
  if (!login.ok) return log(`login failed: ${login.status} ${await login.text()}`);
  const { token } = await login.json();
  const r = await post('/me/password', { currentPassword: 'umami', newPassword: pw }, token);
  log(r.ok ? 'admin password set from UMAMI_ADMIN_PASSWORD' : `password change failed: ${r.status} ${await r.text()}`);
}

(process.argv[2] === 'wait' ? wait() : setup()).catch((e) => log(`error: ${e.message}`));
