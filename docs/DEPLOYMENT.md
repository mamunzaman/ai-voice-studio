# Vercel Deployment Guide — AI Voice Studio

## Prerequisites

- GitHub repo: [mamunzaman/ai-voice-studio](https://github.com/mamunzaman/ai-voice-studio)
- Vercel account linked to GitHub
- ElevenLabs API key + voice IDs
- Cloudflare Turnstile widget (site key + secret)

## Step-by-step (Vercel Dashboard)

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** `mamunzaman/ai-voice-studio`.
3. Framework preset: **Next.js** (auto-detected).
4. Root directory: `.` (repository root).
5. Build command: `npm run build` (default).
6. Output: Next.js default (no custom output directory).
7. Open **Environment Variables** and add every variable from [Production environment checklist](#production-environment-checklist) below.
   - Apply to **Production** and **Preview** (Preview needs Turnstile hostname too if you test PR deploys).
8. Click **Deploy**.
9. After first deploy, copy your URL: `https://<project>.vercel.app`.

## Cloudflare Turnstile (required)

In [Cloudflare Turnstile](https://dash.cloudflare.com/) → your widget → **Hostname management**, add:

| Hostname | When |
|----------|------|
| `localhost` | Local dev |
| `127.0.0.1` | Local dev (if used) |
| `<project>.vercel.app` | Production Vercel URL |
| `*.vercel.app` | Optional: all Vercel preview/production subdomains |
| `yourdomain.com` | Custom domain (when added) |
| `www.yourdomain.com` | Custom domain (when added) |

Without matching hostnames, Turnstile renders but tokens fail with `error-callback` or verify 403.

## Custom domain (later)

1. Vercel project → **Settings** → **Domains** → Add domain.
2. Follow DNS instructions (A/CNAME at your registrar).
3. Add the **same domain** to Cloudflare Turnstile hostname list.
4. Redeploy not required for env; Turnstile hostname change is immediate.

## Production smoke test

- [ ] Open production URL
- [ ] Unlock: password + Turnstile checkbox visible
- [ ] Generate short German/English text → MP3 plays
- [ ] Download MP3 works
- [ ] Wrong password → error + Turnstile remounts
- [ ] DevTools → Network: no `ELEVENLABS_API_KEY` or `TURNSTILE_SECRET_KEY` exposed

## What can break in production

| Issue | Cause | Mitigation |
|-------|--------|------------|
| Turnstile invisible / fails | Hostname not allowed | Add Vercel URL to Cloudflare |
| 401 on generate | `DEMO_PASSWORD` mismatch vs `NEXT_PUBLIC_DEMO_PASSWORD` | Set both to the same value in Vercel |
| 502 on generate | ElevenLabs quota, invalid voice ID, or timeout | Check Vercel function logs; verify voice IDs |
| Cache always MISS | Serverless ephemeral disk | Expected on Vercel; optional KV/Blob later |
| Rate limit inconsistent | In-memory store per instance | MVP only; use Redis/KV for strict limits |
| `/api/usage` public | No auth on route | Disable or protect before heavy traffic |
