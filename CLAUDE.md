# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Threads clone. Currently only the backend exists, under `backend/` — a REST API built with
Express 5, TypeScript (ESM), and Mongoose/MongoDB. All commands below run from `backend/`.

## Commands

```sh
npm run dev        # tsx watch — auto-restarts on file changes
npm run typecheck  # tsc --noEmit
npm run build      # tsc -> dist/
npm start          # run the compiled dist/server.js
npm run lint       # eslint .
```

There is no test runner configured yet. After changes, run `npm run typecheck && npm run build && npm run lint`.

Requires `backend/.env` with `MONGODB_URI` and `JWT_SECRET` (and optional `PORT`, default `8080`;
`CLIENT_URL`, default `http://localhost:3000`; `JWT_EXPIRES_IN`, default `7d`). `server.ts` refuses
to start if `JWT_SECRET` is missing or `MONGODB_URI` is unreachable (both are checked before
`app.listen()`). Smoke-test a running server with `curl http://localhost:8080/health` → `{ "status": "ok" }`.

## Architecture

Layered request flow, one responsibility per directory under `src/`:

```
routes/  ->  controllers/  ->  services/  ->  models/ (Mongoose)
```

- **`routes/`** — Express routers only; mounted in `app.ts`.
- **`controllers/`** — parse/validate the request (Zod `.parse()`), call a service, shape the HTTP response. No business logic.
- **`services/`** — business logic and all DB access via Mongoose models.
- **`models/`** — Mongoose schemas/models only.
- **`utils/validations.ts`** — **all** Zod validation schemas live in this single file (not per-feature).
- **`middleware/`**, **`utils/`** — shared helpers (`error-handler`, `HttpError`).
- `app.ts` builds the Express app (helmet, cors, json, cookie-parser), keeps `GET /health`, mounts routers, and registers `errorHandler` **last**.
- `server.ts` validates `PORT`, connects to MongoDB, then listens.

### Error handling

Controllers and services never format error responses. They `throw` — a Zod `ZodError`, a
`new HttpError(status, message)` (`utils/http-error.ts`), or a Mongoose error — and the central
`errorHandler` middleware maps each to a response. Express 5 forwards rejected promises from async
handlers to it automatically, so `async` controllers can throw directly without a try/catch.

The handler maps: `ZodError` → `400` with per-field `details`; MongoDB duplicate-key (`code 11000`)
→ `409`; `HttpError` → its status; anything else → `500`.

### API conventions

- All business endpoints are prefixed `/api`. **No API version segment** in routes (`/api/auth/register`, not `/api/v1/...`).
- Success envelope: `{ "data": ... }`. Error envelope: `{ "error": { "message", "details"? } }`.
- Never expose `passwordHash`. Map a user document through `toPublicUser()` before returning it.
- Uniqueness (e.g. username/email) is checked upfront in the service **and** enforced by a unique
  index, so concurrent duplicate requests still resolve to `409` via the duplicate-key path.

## Code style

- **ESM with explicit `.js` extensions on relative imports** (NodeNext), e.g. `import { x } from '../utils/validations.js'` — required even though the source is `.ts`.
- **Comments, log output, thrown-error messages, and Zod validation messages are written in English.** (README prose may stay in Uzbek, but keep its example JSON matching the real English API output.)
- Function arguments/vars intentionally unused are prefixed `_` (e.g. `_next` in the 4-arg error handler); ESLint is configured to ignore that prefix.
- When adding a feature, follow the directory split above: controller → `controllers/`, route → `routes/`, service → `services/`, Mongoose model → `models/`, and its Zod schema appended to `utils/validations.ts`.

## Scope

Auth covers `POST /api/auth/register` and `POST /api/auth/login`. Login signs a JWT
(`utils/token.ts` `signAccessToken({ sub })`) and sets it as an httpOnly `access_token` cookie
(`sameSite: lax`, `secure` in production, `maxAge` matched to `JWT_EXPIRES_IN`); the token is
never returned in the body. Login takes `username` + `password` and responds
`401 "Invalid credentials."` identically whether the account is missing or the password is wrong. JWT-protected endpoints, email verification, follow,
and posts are intentionally not implemented yet.
