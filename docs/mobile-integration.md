# Mobile Integration — Quick Start

Everything a native client (iOS first) needs to bind Auth and start calling
the API. Full reference: [auth.md](auth.md), [API.md](API.md),
[/openapi.json](../public/openapi.json).

## Base domain

```
https://www.playbookofburma.com
```

That's the only base URL to hard-code for production. All routes below are
relative to it, e.g. `https://www.playbookofburma.com/api/auth/login`.

- Use the `www` host, not the apex (`playbookofburma.com`) — the apex
  redirects to `www` but its own TLS edge has been intermittently broken
  (`SSL_ERROR_SYSCALL`, cert not served) even though Vercel's dashboard shows
  it as "Valid Configuration". `www` has been verified working end-to-end.
- HTTPS is already enforced (Vercel) — iOS App Transport Security needs no
  exceptions.
- CORS is not relevant to `URLSession`/Alamofire calls (CORS is a
  browser-only mechanism) — nothing to configure on the app side.
- Preview deploys (`*.vercel.app`) exist per-branch but are not stable —
  never hard-code one.

## Required headers

| Header | Value | When |
|---|---|---|
| `Content-Type` | `application/json` | every request with a JSON body |
| `Authorization` | `Bearer <token>` | every request after login (see below) |

## 1. Login

```
POST /api/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "••••••••" }
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

Store `token` (Keychain, not UserDefaults). Send it as
`Authorization: Bearer <token>` on every request from here on — that's the
only thing binding auth requires. Ignore the session cookie entirely; it's
for the browser client.

Token lifetime is `expiresIn` seconds (14 days). There's no refresh endpoint
yet — on `401`, send the user back to login.

Failure cases: `400` missing fields, `401` bad credentials, `403` suspended
account or expired membership. See [auth.md](auth.md#post-apiauthlogin) for
exact bodies.

## 2. Fetch the current user

```
GET /api/auth/me
Authorization: Bearer <token>
```

`200 { "user": { id, email, displayName, photoUrl, role, mustChangePassword, gender, birthYear, region, membership } }`

Call this right after login to hydrate the app's user/session state, and on
cold start to check whether the stored token is still valid (`401` → clear
the stored token, show login).

## 3. First-login forced password change

If `login` returned `mustChangePassword: true` (this happens right after
admin approves a membership submission and emails a temp password), gate
navigation on:

```
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{ "newPassword": "at least 8 chars" }
```

No `currentPassword` needed in this one case. `200 { "ok": true }` — proceed
into the app as normal after this.

## 4. Forgot password (3-step flow)

```
POST /api/auth/forgot-password   { "email" }            → { "ok": true, "uid" }
POST /api/auth/verify-reset-otp  { "uid", "code" }       → { "ok": true }
POST /api/auth/reset-password    { "uid", "password" }   → { "ok": true }
```

None of these need `Authorization` — they're pre-session by design (the OTP
+ `uid` are the proof of identity). After step 3, send the user to the
regular login screen.

## 5. Logout

```
POST /api/auth/logout
```

Server-side this only clears the cookie (irrelevant to the app). For the
native client, logout is purely local: delete the stored token from
Keychain. There's no server-side token revocation — a leaked token is valid
until it expires (14 days) or the account is deactivated, so treat Keychain
storage as security-critical.

## Minimal Swift client

```swift
struct LoginResponse: Decodable {
  let ok: Bool
  let mustChangePassword: Bool
  let role: String
  let token: String
  let expiresIn: Int
}

func login(email: String, password: String) async throws -> LoginResponse {
  var req = URLRequest(url: URL(string: "https://www.playbookofburma.com/api/auth/login")!)
  req.httpMethod = "POST"
  req.setValue("application/json", forHTTPHeaderField: "Content-Type")
  req.httpBody = try JSONEncoder().encode(["email": email, "password": password])
  let (data, response) = try await URLSession.shared.data(for: req)
  guard (response as? HTTPURLResponse)?.statusCode == 200 else {
    throw APIError.from(data) // parse { "error": "..." }
  }
  return try JSONDecoder().decode(LoginResponse.self, from: data)
}

func authorizedRequest(_ path: String, token: String) -> URLRequest {
  var req = URLRequest(url: URL(string: "https://www.playbookofburma.com\(path)")!)
  req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
  return req
}
```

## Profile photo edit

See [profile.md](profile.md) for the full 3-step flow (presign → S3 upload
→ save). Short version: save the `key` from the presign response via
`PATCH /api/user/profile { "photoKey": "..." }` — **not** the presigned
`getUrl` (that one expires after 4h; `photoKey` is permanent and gets
re-presigned fresh on every `GET /api/auth/me`).

## Once auth is bound

Everything else follows the same `Authorization: Bearer <token>` pattern —
`/api/videos`, `/api/podcasts`, `/api/bookmarks`, `/api/notes/{lessonId}`,
`/api/progress/watch`, `/api/progress/podcast`, `/api/user/profile`. All of
them additionally require an **active approved membership** (`403 { "error":
"Active membership required." }` otherwise) except the plain session-only
ones (bookmarks, notes, progress, profile). See [API.md](API.md) for the
full per-route breakdown.
