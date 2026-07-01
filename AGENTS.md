# AGENTS.md

Guidance for AI agents working on **Andsiosa's Creative Quest** (this branch).

## Important — separate from Performing Typography

This game is **not** the Concert Kinetic Typography app. Do **not** deploy it to or document it under:

- ~~https://andmarquez.github.io/performingtypography/~~ (different project on `main`)

Merging this branch to `main` must **not** overwrite that live site. The GitHub Pages workflow skips deploy unless `package.json` name is `concert-kinetic-typography`.

## How to test this game

### Local / LAN

```bash
npm install
npm run dev   # http://127.0.0.1:5173
```

Use the Network URL Vite prints for other devices on the same Wi‑Fi.

### Phone over HTTPS (Cloudflare tunnel)

```bash
npm run dev          # keep running on :5173
npm run phone:tunnel # writes URL to .phone-url
cat .phone-url
```

- Tunnel log: `/tmp/cloudflared.log`
- Do **not** restart the tunnel when editing code — Vite HMR updates through it.
- `vite.config.ts` sets `server.allowedHosts: true` for tunnel hostnames.

### Desktop preview of mobile controls

Add `?mobile=1` to the URL (e.g. `http://127.0.0.1:5173/?mobile=1`).

## Branch note

- **`main`** — Concert Kinetic Typography (React). Leave it alone for this game.
- **`cursor/andsiosa-creative-quest-705a`** (or game feature branches) — Phaser platformer (`src/scenes/`, `src/objects/`).

## Services

| Service | Command | Port |
|---------|---------|------|
| Vite dev server | `npm run dev` | 5173 |
| Vite preview | `npm run build` then `npm run preview` | 4173 |

No backend, database, or Docker.

## Validation

- `npm run build` — TypeScript check + production bundle
- Manual play on `npm run dev` or tunnel URL

## Smoke check

1. `npm run dev`
2. Open http://127.0.0.1:5173/
3. Title: **Andsiosa's Creative Quest** → Enter / tap to start
4. HUD: kisses, timer, projects, lives
5. Mobile: Wild Rift layout — joystick left, jump + abilities right (`?mobile=1` on desktop)

## Replacing placeholder art

See `public/assets/README.md`. Load sprites in `BootScene.ts` using the same texture keys.
