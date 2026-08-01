# Playbook of Burma — API Reference

All routes live under `app/api/**/route.ts` (Next.js App Router route handlers).
`app/admin/**` has no `route.ts` files — admin mutations go through Server
Actions, not HTTP endpoints, and are not covered here.

Base domain: `https://www.playbookofburma.com` (not the apex — see
[mobile-integration.md](mobile-integration.md)).

## Auth model

Every route below authenticates via `getSession()`
([lib/server/auth-helpers.ts](../lib/server/auth-helpers.ts)), which reads the
session cookie, verifies the JWT, and returns `{ uid, email, role } | null`.
Routes check this manually and return `401`/`403` JSON rather than redirecting
(`requireSession()`/`requireAdmin()` redirect and are only used in Server
Components/pages).

- **Public** — no session needed.
- **Session** — valid session cookie (web) **or** `Authorization: Bearer <token>` (native/mobile — token comes from `POST /api/auth/login`, see [auth.md](auth.md)) required, `401 { error: "Unauthenticated." }` otherwise.
- **Admin** — session + `role === "ADMIN"`, `403 { error: "Forbidden." }` otherwise.
- **Member** — session + an active `Membership` with `status: "APPROVED"` and `expiresAt` in the future, `403 { error: "Active membership required." }` otherwise.

All bodies are JSON. Malformed JSON generally returns `400 { error: "Invalid JSON." }`.

---

## Auth

### `POST /api/auth/login`
Public. Authenticates and sets the session cookie.

| | |
|---|---|
| Body | `{ email: string, password: string }` |
| 200 | `{ ok: true, mustChangePassword: boolean, role: string, token: string, expiresIn: number }` |
| 400 | `{ error: "Email and password are required." }` |
| 401 | `{ error: "Invalid email or password." }` |
| 403 | `{ error: "Your account has been suspended. Please contact support." }` |
| 403 | `{ error: "Your membership plan has expired. Please renew to continue." }` |

### `POST /api/auth/logout`
Public. Clears the session cookie. `200 { ok: true }`.

### `GET /api/auth/me`
Session. Returns the current user.

`200 { user: { id, email, displayName, photoUrl, role, mustChangePassword, gender, birthYear, region, membership: { plan, status, expiresAt } } }`

### `POST /api/auth/change-password`
Session. `currentPassword` required unless `user.mustChangePassword` is true.

| | |
|---|---|
| Body | `{ currentPassword?: string, newPassword: string }` |
| 200 | `{ ok: true }` |
| 400 | `{ error: "New password must be at least 8 characters." }` / `{ error: "Current password is required." }` |
| 401 | `{ error: "Current password is incorrect." }` |

### `POST /api/auth/forgot-password`
Public. Starts the reset flow, sends a code by email (10 min expiry).

Body `{ email: string }` → `200 { ok: true, uid: string }`, `404 { error: "No account found with this email." }`

### `POST /api/auth/verify-reset-otp`
Public. Body `{ uid: string, code: string }` → `200 { ok: true }`.
Errors: `{ error: "No reset code found. Please request a new one." }`, `{ error: "Code has expired. Please request a new one." }`, `{ error: "Incorrect code. Please try again." }`.

### `POST /api/auth/reset-password`
Public, gated by the `resetVerified` flag set by verify-reset-otp (not a session).

Body `{ uid: string, password: string }` (min 8 chars) → `200 { ok: true }`.
`403 { error: "OTP not verified. Please complete verification first." }` if not verified.

---

## Admin — dashboard & membership submissions

### `GET /api/admin/dashboard`
Admin. Query `days` (`7 | 30 | 90 | 365`, default `30`). `200` → dashboard stats payload.

### `GET /api/admin/submissions`
Admin. Query `status` (`PENDING | APPROVED | REJECTED | ALL`, default `ALL`).

`200 { counts: { pending, approved, rejected, all }, submissions: [{ id, fullName, email, phone, plan, paymentMethod, amountMmk, screenshotKey, screenshotUrl, note, status, adminNote, reviewedAt, createdAt, resultingUser: { userId, mustChangePassword, tempPassword } | null }] }`

### `POST /api/admin/submissions/{id}/approve`
Admin. Approves a pending submission, provisions a `User` + `Membership` in a transaction, emails a temp password.

| | |
|---|---|
| Body | `{ email?, displayName?, plan?, amountMmk?, adminNote? }` — all optional overrides |
| 200 | `{ ok: true, userId, email, displayName, tempPassword }` |
| 404 | `{ error: "Submission not found." }` |
| 409 | `{ error: "Submission already reviewed." }` |
| 409 | `{ error: "A user with this email already exists." }` |
| 400 | `{ error: "Invalid plan." }` |

### `POST /api/admin/submissions/{id}/reject`
Admin. Body `{ adminNote?: string }` (≤500 chars) → `200 { ok: true }`.
`404`/`409` same as approve.

---

## Admin — S3 uploads

All: Admin only. `403 { error: "Forbidden" }` otherwise.

### `POST /api/admin/uploads/s3/sign-single`
Presigned single `PUT` for small files (thumbnails, images).

Body `{ filename, contentType, kind?: UploadKind }` (default `"thumbnail"`) →
`200 { method: "PUT", url, fields: {}, headers: { "Content-Type" }, key }`

### `POST /api/admin/uploads/s3/multipart/create`
Starts a multipart upload for large files (video).

Body `{ filename, contentType?, kind?: UploadKind }` (default `"video"`) → `200 { uploadId, key }`

### `POST /api/admin/uploads/s3/multipart/sign-part`
Body `{ key, uploadId, partNumber }` → `200 { url, expires: 900 }`

### `POST /api/admin/uploads/s3/multipart/list-parts`
Body `{ key, uploadId }` → `200 [{ PartNumber, Size, ETag }]`

### `POST /api/admin/uploads/s3/multipart/complete`
Body `{ key, uploadId, parts: { ETag?, PartNumber? }[] }` → `200 { location, key }`

### `POST /api/admin/uploads/s3/multipart/abort`
Body `{ key, uploadId }` → `204` no body

`UploadKind = "video" | "thumbnail" | "hero" | "trailer" | "instructor" | "submission" | "audio" | "guidebook"`

---

## Membership (public submission flow)

### `POST /api/membership/sign-screenshot`
Public. Presigns the payment-screenshot upload before form submit.

Body `{ filename, contentType }` — `contentType` must be one of `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`.
`200 { method: "PUT", url, key, headers: { "Content-Type" } }`

### `POST /api/membership/submit`
Public. Creates a `PENDING` `MembershipSubmission` for admin review.

```
{
  fullName: string (≤120),
  email: string,
  phone: string (≤30),
  plan: "SIX_MONTHS" | "TWELVE_MONTHS",
  paymentMethod: "KBZ_PAY" | "WAVE_MONEY",
  screenshotKey: string (≤500, must start with "playbookofburma/submissions/"),
  note?: string (≤500)
}
```

`200 { ok: true, id: submissionId }` — `amountMmk` is derived server-side from the plan.

---

## Videos

### `GET /api/videos`
Member. Paginated list of `PUBLISHED` videos.

Query: `industry?`, `skillset?` (filter by name), `sort?` (accepted but currently always sorts `publishedAt desc, createdAt desc`), `page?` (default 1), `limit?` (default 12, max 50).

`200 { videos: [{ id, titleLine1, titleLine2, description, thumbnailUrl, durationLabel, durationSeconds, publishedAt, industry, skillset, instructorName, instructorTitle }], total, page, limit }`

### `GET /api/videos/{id}`
Member. Full detail for one `PUBLISHED` video, media URLs presigned.

`200 { video: { id, titleLine1, titleLine2, description, thumbnailUrl, trailerUrl, trailerThumbnailUrl, guidebookUrl, guidebookCoverUrl, durationLabel, durationSeconds, publishedAt, industry, skillset, instructor: { id, name, title, photoUrl, biographyParagraphs }, lessons: [{ id, order, title, durationLabel, durationSeconds, details }], skillsetItems: [{ id, order, title, description, imageUrl }] } }`

`404 { error: "Video not found." }`

### `GET /api/videos/{id}/lessons/{lessonId}`
Member. `200 { lesson: { id, videoId, order, title, videoUrl, durationLabel, durationSeconds, details } }`.
`404` if the lesson doesn't exist or doesn't belong to `{id}`.

---

## Podcasts

### `GET /api/podcasts`
Member. Grouped listing with presigned media URLs.

`200 { groups: [{ label: "Popular" | "Season N", items: [{ id, title, description, thumbnailUrl, audioUrl, durationLabel, durationSeconds, season, publishedAt }] }] }` (empty `groups: []` if none published)

---

## Public (no auth)

Unauthenticated equivalents for pre-login/guest browse screens (landing
page, mobile "browse before you join"). No session, no membership, no
`Authorization` header. Separate route files — none of the member-only
routes above were modified. Full detail + examples:
[public-api.md](public-api.md), [video-detail.md](video-detail.md).

### `GET /api/public/videos`
Public. Same as `GET /api/videos` (industry/skillset/sort/page/limit), no auth.

### `GET /api/public/videos/random`
Public. `limit?` (default 12, max 50) random `PUBLISHED` videos, fresh shuffle every call.

### `GET /api/public/videos/{id}`
Public. Same shape as `GET /api/videos/{id}`, **including** `guidebookUrl`/`guidebookCoverUrl`. Lesson `videoUrl` still excluded (same as the member route — requires `GET /api/videos/{id}/lessons/{lessonId}` + membership).

### `GET /api/public/podcasts`
Public. Same as `GET /api/podcasts`, including playable `audioUrl` — full episodes, not previews.

---

## Progress

### `GET /api/progress/watch` · `PATCH /api/progress/watch`
Session.

- GET → `200 { progress: [{ lessonId, currentSeconds, durationSeconds, completedAt, lastWatchedAt, lesson: { videoId, order, title } }] }`
- PATCH body `{ lessonId, currentSeconds: number(≥0), durationSeconds?, completed? }` → `200 { ok: true }` (upsert by `userId_lessonId`)
- `404 { error: "Lesson not found." }` if `lessonId` is invalid.

### `GET /api/progress/podcast` · `PATCH /api/progress/podcast`
Session. Same shape as watch progress, keyed by `podcastId` instead of `lessonId`.

`200 { progress: [{ podcastId, currentSeconds, durationSeconds, completedAt, lastListenedAt, podcast: { title, season, episodeOrder } }] }`

---

## Bookmarks

### `GET /api/bookmarks` · `POST /api/bookmarks`
Session.

- GET → `200 { bookmarks: [{ lessonId, lessonTitle, lessonOrder, lessonDuration, videoId, videoTitle, bookmarkedAt }] }`
- POST body `{ lessonId }` → `200 { ok: true }` (upsert), `404` if lesson doesn't exist.

### `DELETE /api/bookmarks/{lessonId}`
Session. `200 { ok: true }` — idempotent, no error if the bookmark doesn't exist.

---

## Notes

### `GET /api/notes/{lessonId}` · `PUT /api/notes/{lessonId}`
Session.

- GET → `200 { content: string | null, updatedAt: string | null }`
- PUT body `{ content: string }` → `200 { ok: true }`. Empty/whitespace `content` deletes the note instead of storing it.

---

## User

### `PATCH /api/user/profile`
Session. Partial update — only keys present in the body are applied; an empty string clears a field to `null`.

```
{
  displayName?: string | null,
  photoUrl?: string | null,
  gender?: "MALE" | "FEMALE" | "OTHER" | null,
  birthYear?: number | null (1900–current year),
  region?: "YANGON" | "MANDALAY" | "THAILAND" | "OTHER" | null
}
```

`200 { ok: true }`. `400 { error: "No fields to update." }` if the body is empty.

### `POST /api/user/uploads/photo`
Session. Presigns a profile-photo upload.

Body `{ filename, contentType, size? }` — `contentType` must start with `image/`, `size` capped at 10 MB.
`200 { putUrl, getUrl, key }`

---

## Dev

### `GET /api/dev/email-preview`
Dev-only — `404 "Not found"` when `NODE_ENV !== "development"`.

Query `t` (`"welcome" | "reset" | "achievement"`, default `"welcome"`) → `200` HTML preview of the email template, rendered with hardcoded fake data. `400 "Use ?t=welcome | reset | achievement"` for an unknown `t`.
