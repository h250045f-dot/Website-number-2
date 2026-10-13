// api/admin.js - password-protected view of submissions (replaces admin.php)
const crypto = require('crypto');
const { esc, page } = require('../lib/html');
const { hasDb, listSubmissions } = require('../lib/db');

const COOKIE = 'hit_admin';
const PASSWORD = process.env.ADMIN_PASSWORD;

const token = () => crypto.createHmac('sha256', PASSWORD).update('hit-admin-session').digest('hex');
const safeEq = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const getCookie = (req, name) => {
  const m = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : '';
};
function formPassword(req) {
  let b = req.body;
  if (Buffer.isBuffer(b)) b = b.toString('utf8');
  if (typeof b === 'string') return new URLSearchParams(b).get('password') || '';
  return (b && b.password) || '';
}

const loginPage = (err = '') => page('Admin', `
  <section><div class="container">
    <h2>Committee <span>Admin</span></h2>
    <form method="post" action="/admin" class="card form-card">
      ${err ? `<div class="notice bad">${esc(err)}</div>` : ''}
      <label for="password">Password</label>
      <input type="password" id="password" name="password" autocomplete="current-password">
      <button class="btn" style="margin-top:1rem" type="submit">Login</button>
    </form>
  </div></section>`, false);

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (!PASSWORD) {
    return res.status(500).end(page('Admin', '<section><div class="container"><div class="notice bad">Admin is disabled: set the ADMIN_PASSWORD environment variable in Vercel.</div></div></section>', false));
  }

  const url = new URL(req.url, 'http://x');
  if (url.searchParams.has('logout')) {
    res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
    res.statusCode = 302; res.setHeader('Location', '/admin');
    return res.end();
  }

  let authed = safeEq(getCookie(req, COOKIE), token());

  if (!authed && req.method === 'POST') {
    if (safeEq(formPassword(req), PASSWORD)) {
      res.setHeader('Set-Cookie', `${COOKIE}=${token()}; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Strict`);
      authed = true;
    } else {
      return res.status(401).end(loginPage('Wrong password.'));
    }
  }
  if (!authed) return res.status(200).end(loginPage());

  let rows = [], source = 'database', note = '';
  if (hasDb()) {
    try { rows = await listSubmissions(); }
    catch (e) { console.error(e); note = 'Could not read the database: ' + e.message; }
  } else {
    source = 'none';
    note = 'No database connected. Add DATABASE_URL in Vercel (see README). Until then, submissions only appear in Vercel Logs.';
  }

  const cols = ['submitted_at', 'purpose', 'fullname', 'regnumber', 'program', 'email', 'phone', 'games', 'message'];
  const fmt = (c, v) => (c === 'submitted_at' && v ? new Date(v).toISOString().replace('T', ' ').slice(0, 19) : v);

  res.status(200).end(page('Admin', `
  <section><div class="container">
    <h2>Committee <span>Admin</span></h2>
    ${note ? `<div class="notice bad">${esc(note)}</div>` : ''}
    <p>Showing ${rows.length} submission(s) from the ${source === 'none' ? 'database (not connected)' : 'database'}. <a href="/admin?logout=1">Logout</a></p>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Type</th><th>Name</th><th>Reg No.</th><th>Programme</th><th>Email</th><th>Phone</th><th>Games</th><th>Message</th></tr></thead>
      <tbody>${rows.map((r) => '<tr>' + cols.map((c) => `<td>${esc(fmt(c, r[c]))}</td>`).join('') + '</tr>').join('')}</tbody>
    </table></div>
  </div></section>`, false));
};
