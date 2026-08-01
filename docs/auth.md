# Auth API

Routes under `app/api/auth/**/route.ts`. See [API.md](API.md) for the full
platform reference and the session model.

## Session model

- Session is a signed JWT, payload `{ uid, email, role }`, 14-day expiry
  ([lib/server/session.ts](../lib/server/session.ts)).
- **Web**: the JWT is set as an httpOnly cookie (`SESSION_COOKIE_NAME`) on
  `/api/auth/login`. The browser sends it automatically; no client code
  needed.
- **Native clients (iOS/Android)**: `/api/auth/login` also returns the same
  JWT in the response body as `token`. Store it (Keychain on iOS) and send it
  as `Authorization: Bearer <token>` on every subsequent request — the cookie
  won't survive across app launches / isn't accessible to `URLSession` the
  way it is to a browser.
- `getSession()` ([lib/server/auth-helpers.ts](../lib/server/auth-helpers.ts))
  checks the cookie first, then falls back to the `Authorization: Bearer`
  header. Either one authenticates identically — same token, same payload.
- API routes call `getSession()` and return `401`/`403` JSON manually — they
  never redirect (that's only for Server Component pages, via
  `requireSession()` / `requireAdmin()`).

### iOS example

```swift
// Login
var request = URLRequest(url: URL(string: "https://yourdomain.com/api/auth/login")!)
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = try JSONEncoder().encode(["email": email, "password": password])
let (data, _) = try await URLSession.shared.data(for: request)
let res = try JSONDecoder().decode(LoginResponse.self, from: data) // has `.token`
// Save res.token to Keychain.

// Every authenticated request after that:
var req = URLRequest(url: URL(string: "https://yourdomain.com/api/videos")!)
req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
```

No CORS setup is needed for this — CORS is a browser-only mechanism and
`URLSession` isn't subject to it. `proxy.ts` still sets CORS headers on
`/api/*` for browser-based callers (a future web dashboard, WKWebView,
Swagger's "Try it out"); configure allowed origins via the
`CORS_ALLOWED_ORIGINS` env var (comma-separated).

---

## `POST /api/auth/login`

Authenticates and sets the session cookie.

**Body**
```json
{ "email": "string", "password": "string" }
```

**200**
```json
{
  "ok": true,
  "mustChangePassword": false,
  "role": "USER",
  "token": "eyJhbGciOi...",
  "expiresIn": 1209600
}
```
`token` is the bearer token for native clients (see below). `expiresIn` is
seconds until expiry (14 days).

**Errors**
| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "Email and password are required." }` | missing field |
| 401 | `{ "error": "Invalid email or password." }` | no matching user, or bad password |
| 403 | `{ "error": "Your account has been suspended. Please contact support." }` | `user.isActive === false` |
| 403 | `{ "error": "Your membership plan has expired. Please renew to continue." }` | approved membership, `expiresAt` in the past |
| 500 | `{ "error": "<message>" }` | unexpected |

---

## `POST /api/auth/logout`

No body. Deletes the session cookie.

**200** `{ "ok": true }`

---

## `GET /api/auth/me`

Requires a session. Loads the full user record.

**200**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "displayName": "string | null",
    "photoUrl": "string | null",
    "role": "string",
    "mustChangePassword": false,
    "gender": "string | null",
    "birthYear": "number | null",
    "region": "string | null",
    "membership": { "plan": "string", "status": "string", "expiresAt": "date | null" } | null
  }
}
```

**401** `{ "error": "Unauthenticated." }`

---

## `POST /api/auth/change-password`

Requires a session. `currentPassword` is required unless the user still has
`mustChangePassword: true` (e.g. first login after admin-approval).

**Body**
```json
{ "currentPassword": "string?", "newPassword": "string (min 8 chars)" }
```

**200** `{ "ok": true }`

**Errors**
| Status | Body | Cause |
|---|---|---|
| 401 | `{ "error": "Unauthenticated." }` | no session |
| 400 | `{ "error": "New password must be at least 8 characters." }` | |
| 400 | `{ "error": "Current password is required." }` | `mustChangePassword` is false and field omitted |
| 401 | `{ "error": "Current password is incorrect." }` | |
| 404 | `{ "error": "User not found." }` | |
| 500 | `{ "error": "<message>" }` | |

Also clears `mustChangePassword` and `tempPasswordPlain` on success.

---

## `POST /api/auth/forgot-password`

Public. Starts the reset flow — emails a one-time code and sets
`resetCode` / `resetCodeExpiry` (10 min) / `resetVerified: false` on the user.

> Note: the current implementation sends a hardcoded OTP (`"123456"`) —
> flagged as a TODO to wire up real code generation.

**Body** `{ "email": "string" }`

**200** `{ "ok": true, "uid": "string" }`

**Errors**: `400 { "error": "Email is required." }`, `404 { "error": "No account found with this email." }`, `500 { "error": "<message>" }`

---

## `POST /api/auth/verify-reset-otp`

Public. Verifies the code sent by `forgot-password`.

**Body** `{ "uid": "string", "code": "string" }`

**200** `{ "ok": true }` — sets `resetVerified: true`, clears the code.

**Errors**
| Status | Body |
|---|---|
| 400 | `{ "error": "uid and code are required." }` |
| 400 | `{ "error": "No reset code found. Please request a new one." }` |
| 400 | `{ "error": "Code has expired. Please request a new one." }` |
| 400 | `{ "error": "Incorrect code. Please try again." }` |
| 500 | `{ "error": "<message>" }` |

---

## `POST /api/auth/reset-password`

Public — gated by the `resetVerified` flag set by `verify-reset-otp`, not a
session.

**Body** `{ "uid": "string", "password": "string (min 8 chars)" }`

**200** `{ "ok": true }` — sets a new `passwordHash`, clears the reset fields.

**Errors**
| Status | Body |
|---|---|
| 400 | `{ "error": "uid and a password of at least 8 characters are required." }` |
| 403 | `{ "error": "OTP not verified. Please complete verification first." }` |
| 500 | `{ "error": "<message>" }` |

---

## Typical flows

**Login**
```
POST /api/auth/login  { email, password }  → session cookie set
GET  /api/auth/me                          → current user
```

**Forced first-login password change** (after admin approves a membership submission)
```
POST /api/auth/login             → { mustChangePassword: true }
POST /api/auth/change-password   { newPassword }   (no currentPassword needed)
```

**Forgot password**
```
POST /api/auth/forgot-password    { email }              → { uid }
POST /api/auth/verify-reset-otp   { uid, code }           → resetVerified = true
POST /api/auth/reset-password     { uid, password }       → done, sign in again
```
