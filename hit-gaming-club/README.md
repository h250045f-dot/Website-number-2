# HIT Gaming Club website (Vercel version)

Static pages (HTML/CSS/JS) + two serverless functions in `/api`:

- `api/submit.js` – receives the Join/Contact form (was `process.php`)
- `api/admin.js` – password-protected submissions list at `/admin` (was `admin.php`)

## Deploy
1. Push this folder to a GitHub repo (the folder contents must be at the repo root).
2. On vercel.com: **Add New → Project → import the repo**. Framework preset: **Other**. Leave build settings empty. Deploy.
3. **Database** (so submissions are stored): Project → **Storage** → create/connect a **Neon (Postgres)** database.
   Vercel adds `DATABASE_URL` automatically. The `submissions` table is created on the first submission.
4. **Admin password**: Project → Settings → Environment Variables → add `ADMIN_PASSWORD` (your own strong password).
5. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variables take effect.
6. Test: submit the form on `/join.html`, then open `/admin`.

Without step 3 the form still works, but data only appears in Vercel → Logs.

## Notes
- Vercel can't run PHP or write files, so MySQL/CSV storage was replaced with Postgres.
- Replace `images/gallery1-8.png`, club details and events (in `js/main.js`) with your real ones.
