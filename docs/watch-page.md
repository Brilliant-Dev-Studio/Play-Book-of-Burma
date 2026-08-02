# `/user-portal/watch?video={id}` — Full API Spec

Everything needed to build this screen (video player, lesson list, notes,
bookmark, resume progress, achievement) as a standalone mobile screen. This
file is self-contained — no need to cross-reference other docs to implement
it.

**Note on the web implementation:** the actual Next.js page at this route
doesn't call any of these as REST endpoints — it's a Server Component that
queries the database directly, plus Server Actions for the interactive bits.
Server Actions are Next.js-internal RPC and don't work from a mobile app.
Everything below is the REST equivalent, built for this purpose.

## Base domain & auth

```
https://www.playbookofburma.com
```

Every endpoint below requires:
- Session — `Authorization: Bearer <token>` header (token from `POST /api/auth/login`)
- **Active approved membership** on top of session for the video endpoints (`GET /api/videos/*`) — `403 { "error": "Active membership required." }` otherwise. Bookmarks/notes/progress only require session, no membership check.
- `Content-Type: application/json` on every request with a body

---

## 1. Load the screen

### `GET /api/videos/{id}`
Video title, instructor, description, trailer, guidebook, and the lesson
list (metadata only — no lesson video URLs yet).

```
GET https://www.playbookofburma.com/api/videos/{id}
Authorization: Bearer <token>
```

**200**
```json
{
  "video": {
    "id": "clx...",
    "titleLine1": "Learn Finance in 21 Day, Become",
    "titleLine2": "Master at it",
    "description": "...",
    "thumbnailUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-...",
    "trailerUrl": "https://<bucket>.s3.../trailers/...?X-Amz-...",
    "trailerThumbnailUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-...",
    "guidebookUrl": "https://<bucket>.s3.../guidebooks/...?X-Amz-...",
    "guidebookCoverUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-...",
    "durationLabel": "1 hour 15 minutes",
    "durationSeconds": 4500,
    "publishedAt": "2026-04-01T00:00:00.000Z",
    "industry": "Finance",
    "skillset": "Investing",
    "instructor": {
      "id": "clx...",
      "name": "Ko Jason Myint",
      "title": "CEO of BYD By Essentials",
      "photoUrl": "https://<bucket>.s3.../instructors/...?X-Amz-...",
      "biographyParagraphs": ["...", "..."]
    },
    "lessons": [
      { "id": "clx-lesson-1", "order": 0, "title": "What is Lorem Ipsum?", "durationLabel": "12 minutes 13 seconds", "durationSeconds": 733, "details": "..." }
    ],
    "skillsetItems": [
      { "id": "clx...", "order": 0, "title": "What is Lorem Ipsum?", "description": "...", "imageUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-..." }
    ]
  }
}
```
**Errors**: `401 { "error": "Unauthenticated." }`, `403 { "error": "Active membership required." }`, `404 { "error": "Video not found." }`.

### `GET /api/bookmarks`
All of the user's bookmarked lessons (across every video) — check whether
the active lesson's id is in this list to set the bookmark toggle's initial
state.

```
GET https://www.playbookofburma.com/api/bookmarks
Authorization: Bearer <token>
```

**200**
```json
{
  "bookmarks": [
    { "lessonId": "clx-lesson-1", "lessonTitle": "What is Lorem Ipsum?", "lessonOrder": 0, "lessonDuration": "12 minutes 13 seconds", "videoId": "clx...", "videoTitle": "Learn Finance in 21 Day, Become Master at it", "bookmarkedAt": "2026-08-01T10:00:00.000Z" }
  ]
}
```
**401** `{ "error": "Unauthenticated." }`

### `GET /api/notes/{lessonId}`
Saved note text for one lesson (call once per lesson, e.g. when the user
switches lessons or opens the Notes tab).

```
GET https://www.playbookofburma.com/api/notes/{lessonId}
Authorization: Bearer <token>
```

**200** `{ "content": "My notes here...", "updatedAt": "2026-08-01T10:00:00.000Z" }` — both `null` if no note saved yet.
**401** `{ "error": "Unauthenticated." }`

### `GET /api/progress/watch`
All lesson watch progress for the user — find the entry matching the active
`lessonId` to resume playback at `currentSeconds`.

```
GET https://www.playbookofburma.com/api/progress/watch
Authorization: Bearer <token>
```

**200**
```json
{
  "progress": [
    {
      "lessonId": "clx-lesson-1",
      "currentSeconds": 996,
      "durationSeconds": 733,
      "completedAt": null,
      "lastWatchedAt": "2026-08-01T10:22:00.000Z",
      "lesson": { "videoId": "clx...", "order": 0, "title": "What is Lorem Ipsum?" }
    }
  ]
}
```
**401** `{ "error": "Unauthenticated." }`

### `GET /api/videos/{id}/lessons/{lessonId}`
The actual playable video URL for the lesson the user presses play on. Call
this once, when the user selects a lesson — not upfront for the whole list.

```
GET https://www.playbookofburma.com/api/videos/{id}/lessons/{lessonId}
Authorization: Bearer <token>
```

**200**
```json
{
  "lesson": {
    "id": "clx-lesson-1",
    "videoId": "clx...",
    "order": 0,
    "title": "What is Lorem Ipsum?",
    "videoUrl": "https://<bucket>.s3.../videos/...?X-Amz-...",
    "durationLabel": "12 minutes 13 seconds",
    "durationSeconds": 733,
    "details": "..."
  }
}
```
`videoUrl` is presigned, 6h TTL — re-fetch this endpoint if the user resumes
much later than that. **Errors**: `401`, `403 { "error": "Active membership required." }`, `404 { "error": "Lesson not found." }` (bad id, or lesson belongs to a different video than `{id}`).

---

## 2. While playing

### `PATCH /api/progress/watch`
Call periodically (every 10–15s) while the video plays, and once more on
pause/exit, to save resume position.

```
PATCH https://www.playbookofburma.com/api/progress/watch
Authorization: Bearer <token>
Content-Type: application/json

{ "lessonId": "clx-lesson-1", "currentSeconds": 340, "durationSeconds": 733, "completed": false }
```
`lessonId` and `currentSeconds` (≥0) required; `durationSeconds` and
`completed` optional.

**Send `completed: true` explicitly once the lesson finishes** — apply this
rule client-side (the API doesn't infer it): `currentSeconds >= durationSeconds - 5` OR `currentSeconds / durationSeconds >= 0.95`.

The first time a lesson flips to `completed: true`, the server also checks
whether *every* lesson in the video is now complete and, if so, awards a
`PlaybookAchievement` (shows up in "My Progress") — no extra call needed for
that, it's automatic on this same request.

**200** `{ "ok": true }`
**Errors**: `401`, `400 { "error": "Invalid JSON." }`, `400 { "error": "lessonId required." }`, `400 { "error": "currentSeconds must be a non-negative number." }`, `404 { "error": "Lesson not found." }`.

---

## 3. Notes tab

### `PUT /api/notes/{lessonId}`
Save (or clear) the note for the active lesson — call on blur/debounce, not
every keystroke.

```
PUT https://www.playbookofburma.com/api/notes/{lessonId}
Authorization: Bearer <token>
Content-Type: application/json

{ "content": "Updated note text" }
```
Empty/whitespace `content` **deletes** the note instead of storing an empty string.

**200** `{ "ok": true }`
**Errors**: `401`, `400 { "error": "Invalid JSON." }`, `400 { "error": "content must be a string." }`, `404 { "error": "Lesson not found." }`.

---

## 4. Bookmark toggle

### `POST /api/bookmarks`
Add a bookmark for the active lesson.

```
POST https://www.playbookofburma.com/api/bookmarks
Authorization: Bearer <token>
Content-Type: application/json

{ "lessonId": "clx-lesson-1" }
```
**200** `{ "ok": true }` (upsert — safe to call even if already bookmarked)
**Errors**: `401`, `400 { "error": "Invalid JSON." }`, `400 { "error": "lessonId required." }`, `404 { "error": "Lesson not found." }`.

### `DELETE /api/bookmarks/{lessonId}`
Remove the bookmark.

```
DELETE https://www.playbookofburma.com/api/bookmarks/{lessonId}
Authorization: Bearer <token>
```
**200** `{ "ok": true }` — idempotent, no error if it wasn't bookmarked.
**401** `{ "error": "Unauthenticated." }`

---

## Screen build order

```
1. GET /api/videos/{id}                          → title, instructor, lesson list
2. GET /api/bookmarks                             → mark bookmarked lessons
3. GET /api/progress/watch                        → resume positions per lesson
4. User selects a lesson (default: first, or the one with progress):
   GET /api/notes/{lessonId}                      → notes tab content
   GET /api/videos/{id}/lessons/{lessonId}         → videoUrl, start playback
     → seek to progress[lessonId].currentSeconds if present
5. While playing:
   PATCH /api/progress/watch  (every 10–15s + on pause/exit)
6. User taps bookmark icon:
   POST /api/bookmarks  or  DELETE /api/bookmarks/{lessonId}
7. User edits Notes tab, blurs the field:
   PUT /api/notes/{lessonId}
```
