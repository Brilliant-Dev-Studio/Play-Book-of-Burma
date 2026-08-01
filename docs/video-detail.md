# Video Detail — Guest Screen ("Start Now" / "Trailer")

Two routes back this screen now:

- **`GET /api/public/videos/{id}`** — new, no auth, use this for guest mode.
- **`GET /api/videos/{id}`** — existing, requires session + membership, used
  once the user is actually logged in.

## `GET /api/public/videos/{id}`

No `Authorization` header needed.

```
GET https://www.playbookofburma.com/api/public/videos/{id}
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
      { "id": "clx...", "order": 0, "title": "Intro", "durationLabel": "8 minutes", "durationSeconds": 480, "details": "..." }
    ],
    "skillsetItems": [
      { "id": "clx...", "order": 0, "title": "What is Lorem Ipsum?", "description": "...", "imageUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-..." }
    ]
  }
}
```

**404** `{ "error": "Video not found." }` — unpublished or bad id.

**Same shape as the private route, including `guidebookUrl` /
`guidebookCoverUrl`** — the PDF guidebook is available pre-login too (by
request, 2026-08-01). Only lesson `videoUrl` stays excluded (was always
gated behind the separate lesson-fetch call, same as the private route).
`trailerUrl` is included, meant to be freely watchable as a hook, matching
the "Watch Trailer" card in the screenshot. Wire the guest screen's
"Start Now" button to a login/signup prompt — actual lesson **video**
playback still needs `/api/videos/{id}/lessons/{lessonId}` + membership.

---

## `GET /api/videos/{id}` (existing, member-only)

Unchanged — full detail for the logged-in watch flow, already documented in
[API.md](API.md), repeated here since it's what backs the same screen once a
real session exists. Requires a session + active membership —
`401`/`403` for a logged-out guest (that's what the guest screen was hitting
before `/api/public/videos/{id}` existed).

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
      { "id": "clx...", "order": 0, "title": "Intro", "durationLabel": "8 minutes", "durationSeconds": 480, "details": "..." }
    ],
    "skillsetItems": [
      { "id": "clx...", "order": 0, "title": "What is Lorem Ipsum?", "description": "...", "imageUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-..." }
    ]
  }
}
```

**Errors**: `401 { "error": "Unauthenticated." }`, `403 { "error": "Active membership required." }`, `404 { "error": "Video not found." }`.

### Notable — lesson video is already gated separately

`lessons[]` here has **no `videoUrl`** — just metadata (title, order,
duration, details). Getting the actual playable lesson video is a second
call:

```
GET https://www.playbookofburma.com/api/videos/{id}/lessons/{lessonId}
```
`200 { "lesson": { id, videoId, order, title, videoUrl, durationLabel, durationSeconds, details } }`

So even for a logged-in member, the detail screen and the "what's inside"
list load without ever fetching paid video URLs — only pressing play on a
specific lesson fetches its `videoUrl`. `trailerUrl` is the exception: it's
included directly in the detail response, since the trailer is meant to be
freely watchable as a hook (matches the "Watch Trailer" card in the
screenshot).

### Guest/pre-login use

Use `GET /api/public/videos/{id}` (above) for the guest screen instead — it
returns the identical shape, no auth needed.
