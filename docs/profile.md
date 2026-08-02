# Profile Photo Upload — Mobile

3 calls: presign an upload, `PUT` the image straight to S3, save the
permanent key onto the user. Base domain: `https://www.playbookofburma.com`.
Every call needs `Authorization: Bearer <token>` (see [auth.md](auth.md)).

> **Fixed 2026-08-02**: this used to store a presigned URL directly (expired
> after 4h, silently breaking the photo). It now stores the permanent S3
> `key` and re-presigns a fresh URL on every read — follow the flow below,
> not any older version of this doc.

## 1. Presign the upload

```
POST https://www.playbookofburma.com/api/user/uploads/photo
Authorization: Bearer <token>
Content-Type: application/json

{ "filename": "avatar.jpg", "contentType": "image/jpeg", "size": 482913 }
```
`contentType` must start with `image/`. `size` (bytes, optional) is capped
at 10 MB server-side — reject client-side first for a faster error.

**200**
```json
{
  "putUrl": "https://<bucket>.s3.<region>.amazonaws.com/playbookofburma/instructors/...?X-Amz-...",
  "getUrl": "https://<bucket>.s3.<region>.amazonaws.com/playbookofburma/instructors/...?X-Amz-...",
  "key": "playbookofburma/instructors/ab12cd34/avatar.jpg"
}
```
**Errors**: `401 { "error": "Unauthenticated." }`, `400 { "error": "Missing filename or contentType." }`, `400 { "error": "Only image files are allowed." }`, `400 { "error": "File too large (max 10 MB)." }`.

`getUrl` is presigned (4h TTL) — fine to show as an immediate local preview
while the user is still on the screen, but **don't persist it anywhere**.
Only `key` matters for step 3.

## 2. Upload the bytes to S3 directly

```
PUT <putUrl>
Content-Type: image/jpeg

<raw image bytes>
```
Goes straight to S3, not your API — `200`/`204` empty body on success. Same
`contentType` you sent in step 1.

## 3. Save the key on the profile

```
PATCH https://www.playbookofburma.com/api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{ "photoKey": "playbookofburma/instructors/ab12cd34/avatar.jpg" }
```
**This is the field that actually persists the photo — `key` from step 1,
not `getUrl`.** Send `"photoKey": null` to remove the photo.

`PATCH /api/user/profile` is a partial update — only send the fields
you're changing (`displayName`, `photoKey`, `gender`, `birthYear`, `region`
are all independently optional; omitted keys are left untouched).

**200** `{ "ok": true }`
**Errors**: `401`, `400 { "error": "Invalid photoKey." }` (not a string, or doesn't look like an S3 key from this bucket), `400 { "error": "No fields to update." }` (empty body).

## 4. Read it back

```
GET https://www.playbookofburma.com/api/auth/me
Authorization: Bearer <token>
```
`200 { "user": { ..., "photoUrl": "https://...?X-Amz-..." } }` — freshly
presigned on every call, safe to display directly, never expires from the
app's perspective (a new one is generated each time you fetch `/me`).

## Common mistake

Uploading (steps 1–2) alone does **not** save anything — it only puts the
file in S3 and gets you a `key`. Step 3 (`PATCH /api/user/profile` with that
`key`) is what actually attaches it to the account. If a photo "disappears"
after upload, check whether step 3 actually fired — this is the #1 cause on
the web client too (upload updates the local preview instantly, making it
easy to think it's already saved).
