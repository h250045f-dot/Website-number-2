// api/submit.js - handles the Join/Contact form (replaces process.php)
const { esc, page } = require('../lib/html');
const { hasDb, insertSubmission } = require('../lib/db');

function parseBody(req) {
  let b = req.body;
  if (Buffer.isBuffer(b)) b = b.toString('utf8');
  if (typeof b === 'string') {
    const out = {};
    for (const [k, v] of new URLSearchParams(b)) {
      if (k in out) out[k] = [].concat(out[k], v); else out[k] = v;
    }
    return out;
  }
  return b && typeof b === 'object' ? b : {};
}
const str = (v) => (Array.isArray(v) ? v[0] : v ?? '').toString().trim();

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (req.method !== 'POST') {
    res.statusCode = 302;
    res.setHeader('Location', '/join.html');
    return res.end();
  }

  const b = parseBody(req);
  const games = [].concat(b['games[]'] ?? b.games ?? []).map((g) => String(g).trim()).filter(Boolean);

  const d = {
    purpose: str(b.purpose) === 'contact' ? 'contact' : 'join',
    fullname: str(b.fullname).slice(0, 100),
    regnumber: str(b.regnumber),
    program: str(b.program).slice(0, 80),
    email: str(b.email).slice(0, 120),
    phone: str(b.phone).slice(0, 20),
    games: games.join(', ').slice(0, 255),
    message: str(b.message).slice(0, 300),
  };

  // ---- Server-side validation (never trust the browser) ----
  const errors = [];
  if (d.fullname.length < 3) errors.push('Please enter your full name.');
  if (!/^[A-Za-z0-9\/-]{5,20}$/.test(d.regnumber)) errors.push('Invalid registration number.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.push('Invalid email address.');
  if (!d.program) errors.push('Please select your programme.');
  if (!b.consent) errors.push('You must agree to the club rules.');

  let saved = false;
  if (!errors.length) {
    try {
      if (hasDb()) {
        await insertSubmission(d);
      } else {
        // No database connected yet: keep the data in Vercel's function logs so nothing is lost.
        console.log('SUBMISSION (no DATABASE_URL set):', JSON.stringify(d));
      }
      saved = true;
    } catch (e) {
      console.error('DB error:', e);
      errors.push('Sorry, we could not save your details right now. Please try again later.');
    }
  }

  if (saved) {
    return res.status(200).end(page('Submission Result', `
  <section><div class="container"><div class="card form-card">
    <div class="notice ok">
      <h2>&#127918; Thank you, ${esc(d.fullname)}!</h2>
      <p>${d.purpose === 'join'
        ? 'Your membership request has been received. A committee member will contact you soon.'
        : 'Your message has been received. We will reply as soon as possible.'}</p>
    </div>
    <h3>Your details</h3>
    <ul class="about-list">
      <li><strong>Reg. number:</strong> ${esc(d.regnumber)}</li>
      <li><strong>Programme:</strong> ${esc(d.program)}</li>
      <li><strong>Email:</strong> ${esc(d.email)}</li>
      <li><strong>Games:</strong> ${d.games ? esc(d.games) : 'Not specified'}</li>
    </ul>
    <p style="margin-top:1.2rem"><a class="btn" href="/index.html">Back to Home</a></p>
  </div></div></section>`));
  }

  return res.status(errors.some((e) => e.startsWith('Sorry')) ? 500 : 400).end(page('Submission Result', `
  <section><div class="container"><div class="card form-card">
    <div class="notice bad">
      <h2>Please fix the following</h2>
      <ul class="about-list">${errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
    </div>
    <p><a class="btn" href="/join.html">Go back</a></p>
  </div></div></section>`));
};
