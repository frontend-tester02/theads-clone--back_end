# Threads clone backend

A starter project built with Node.js, Express, TypeScript and Mongoose.
Use Node.js 24 LTS and npm.

## Setup

From the project root:

```sh
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

- `MONGODB_URI` — your MongoDB connection string (required).
- `JWT_SECRET` — a long random string used to sign JWTs (required).
- `JWT_EXPIRES_IN` — token lifetime, default `7d`.
- `PORT` — default `8080`.
- `CLIENT_URL` — default `http://localhost:3000`.

Never commit your real `.env` or connection string to Git. MongoDB must be running and
reachable from the server. The server will not start if `JWT_SECRET` is missing or
`MONGODB_URI` is empty/unreachable.

## Running

Development mode (auto-restarts on file changes):

```sh
npm run dev
```

Type-check and build:

```sh
npm run typecheck
npm run build
npm start
```

Extra code check: `npm run lint`.

Once the server is running:

```sh
curl http://localhost:8080/check
```

Response: `{ "status": "Welcome to Threads" }`. This endpoint reports the HTTP server status.

## API

All business endpoints are prefixed with `/api` (no API version segment).

### `POST /api/auth/register`

Registers a new user. The password is never stored in plain text — only its bcrypt hash
is saved, and `passwordHash` is never returned in the response.

Request body (JSON):

| Field         | Type   | Requirement                                                      |
| ------------- | ------ | ---------------------------------------------------------------- |
| `username`    | string | 3–30 chars; letters, numbers, `_`, `.`; trimmed and lowercased   |
| `email`       | string | Valid email; trimmed and lowercased                              |
| `password`    | string | 8–72 chars                                                       |
| `displayName` | string | 1–50 chars                                                       |

Example request:

```sh
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "jamshid",
    "email": "jamshid@example.com",
    "password": "supersecret1",
    "displayName": "Jamshid"
  }'
```

Successful response — `201 Created`:

```json
{
  "data": {
    "user": {
      "id": "6ac103218fb094be1df8567d",
      "username": "jamshid",
      "email": "jamshid@example.com",
      "displayName": "Jamshid",
      "bio": "",
      "avatarUrl": "",
      "isPrivate": false,
      "createdAt": "2026-10-03T13:29:05.340Z"
    }
  }
}
```

Error responses use the `{ "error": { "message": ... } }` shape:

- `400 Bad Request` — validation error (invalid email, short password, invalid username
  format, etc.). The response includes a per-field explanation under `error.details`:

  ```json
  {
    "error": {
      "message": "The submitted data is invalid.",
      "details": [{ "field": "email", "message": "Invalid email address." }]
    }
  }
  ```

- `409 Conflict` — `username` or `email` is already taken (a MongoDB duplicate-key from
  concurrent identical requests also maps to this code):

  ```json
  { "error": { "message": "Email is already taken." } }
  ```

### `GET /api/auth/me`

Returns the authenticated user's public profile. Protected — it reads the `access_token`
httpOnly cookie set at login and verifies the JWT. The token is never read from the body
or a header.

Example request (reusing the cookie saved at login):

```sh
curl http://localhost:8080/api/auth/me \
  -b 'access_token=<jwt-from-login-cookie>'
```

Successful response — `200 OK`:

```json
{
  "data": {
    "id": "6ac103218fb094be1df8567d",
    "username": "jamshid",
    "email": "jamshid@example.com",
    "displayName": "Jamshid",
    "bio": "",
    "avatarUrl": "",
    "isPrivate": false,
    "createdAt": "2026-10-03T13:29:05.340Z"
  }
}
```

Error responses use the `{ "error": { "message": ... } }` shape:

- `401 Unauthorized` — no access-token cookie was sent:

  ```json
  { "error": { "message": "Not authenticated" } }
  ```

- `401 Unauthorized` — the token is invalid or expired:

  ```json
  { "error": { "message": "Invalid token" } }
  ```

- `404 Not Found` — the token is valid but no matching user exists (e.g. a deleted account):

  ```json
  { "error": { "message": "User not found" } }
  ```
