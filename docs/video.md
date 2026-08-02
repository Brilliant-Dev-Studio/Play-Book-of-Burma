# Video API — Authenticated Members

Two routes, both under `app/api/videos/**/route.ts`. **Member only** —
session (cookie or `Authorization: Bearer <token>`, see [auth.md](auth.md))
**and** an active approved membership. Base domain:
`https://www.playbookofburma.com`.

For the same video detail without auth (guest/pre-login), see
[video-detail.md](video-detail.md) — `GET /api/public/videos/{id}`.

---

## `GET /api/videos/{id}`

Full detail for one `PUBLISHED` video — the watch page / video detail
screen once a user is logged in with an active membership.

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

**Errors**
| Status | Body | Cause |
|---|---|---|
| 401 | `{ "error": "Unauthenticated." }` | no session |
| 403 | `{ "error": "Active membership required." }` | session present, no active approved membership |
| 404 | `{ "error": "Video not found." }` | wrong id, or status isn't `PUBLISHED` |

**`lessons[]` has no `videoUrl`** — just metadata (title, order, duration,
details), enough to render the "what's inside" lesson list. Getting the
actual playable video for one lesson is the second endpoint below.
`trailerUrl` is the one video URL included directly here, since it's meant
to be freely watchable as a hook.

---

## `GET /api/videos/{id}/lessons/{lessonId}`

One lesson's playable video, presigned. Call this when the user actually
presses play on a specific lesson — not upfront for the whole list.

```
GET https://www.playbookofburma.com/api/videos/{id}/lessons/{lessonId}
Authorization: Bearer <token>
```

**200**
```json
{
  "lesson": {
    "id": "clx...",
    "videoId": "clx...",
    "order": 0,
    "title": "Intro",
    "videoUrl": "https://<bucket>.s3.../videos/...?X-Amz-...",
    "durationLabel": "8 minutes",
    "durationSeconds": 480,
    "details": "..."
  }
}
```

**Errors**
| Status | Body | Cause |
|---|---|---|
| 401 | `{ "error": "Unauthenticated." }` | no session |
| 403 | `{ "error": "Active membership required." }` | session present, no active approved membership |
| 404 | `{ "error": "Lesson not found." }` | `lessonId` doesn't exist, **or** it exists but belongs to a different video than `{id}` in the URL |

`videoUrl` is a presigned S3 URL, `PRESIGN_TTL.video` = 6h — don't cache it
past that; re-fetch this endpoint if the user resumes much later.

---

## Typical flow

```
GET /api/videos/{id}                         → title, instructor, lesson list (no video), trailer
                                                 user picks a lesson, presses play
GET /api/videos/{id}/lessons/{lessonId}       → videoUrl for that one lesson
                                                 (stream it, then report progress:)
PATCH /api/progress/watch  { lessonId, currentSeconds }   → see progress.md
```
