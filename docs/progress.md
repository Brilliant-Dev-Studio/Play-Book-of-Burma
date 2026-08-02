# Progress API

Routes under `app/api/progress/**/route.ts` — per-user watch/listen position,
used for resume-playback and the "Continues Watching" row. Session required
(cookie web, or `Authorization: Bearer <token>` native — see
[auth.md](auth.md)). Base domain: `https://www.playbookofburma.com`.

---

## `GET /api/progress/watch`

All lesson (video) watch progress for the current user, most recent first.

```
GET https://www.playbookofburma.com/api/progress/watch
Authorization: Bearer <token>
```

**200**
```json
{
  "progress": [
    {
      "lessonId": "clx...",
      "currentSeconds": 996,
      "durationSeconds": 1440,
      "completedAt": null,
      "lastWatchedAt": "2026-08-01T10:22:00.000Z",
      "lesson": {
        "videoId": "clx...",
        "order": 1,
        "title": "Financial Management I Lesson 2 of 10"
      }
    }
  ]
}
```

**401** `{ "error": "Unauthenticated." }`

## `PATCH /api/progress/watch`

Upserts progress for one lesson — call this periodically (e.g. every 10–15s)
while a lesson video plays, and once more on pause/exit.

**Body**
```json
{ "lessonId": "clx...", "currentSeconds": 996, "durationSeconds": 1440, "completed": false }
```
`lessonId` and `currentSeconds` (≥0) are required. `durationSeconds` and
`completed` are optional — omit `completed` unless the lesson actually
finished (sets `completedAt`).

Sending `completed: true` for the first time on a lesson also checks whether
every lesson in that lesson's video is now complete, and if so awards a
`PlaybookAchievement` (shows up in "My Progress"). See
[watch-page.md](watch-page.md#playbook-completion-achievement) for the
completion rule to apply client-side.

**200** `{ "ok": true }`

**Errors**: `401 { "error": "Unauthenticated." }`, `400 { "error": "Invalid JSON." }`, `400 { "error": "lessonId required." }`, `400 { "error": "currentSeconds must be a non-negative number." }`, `404 { "error": "Lesson not found." }`.

---

## `GET /api/progress/podcast`

Same idea, keyed by `podcastId` instead of `lessonId`.

```
GET https://www.playbookofburma.com/api/progress/podcast
Authorization: Bearer <token>
```

**200**
```json
{
  "progress": [
    {
      "podcastId": "clx...",
      "currentSeconds": 512,
      "durationSeconds": 5040,
      "completedAt": null,
      "lastListenedAt": "2026-08-01T09:10:00.000Z",
      "podcast": { "title": "CEO of Capital Retail...", "season": 1, "episodeOrder": 3 }
    }
  ]
}
```

**401** `{ "error": "Unauthenticated." }`

## `PATCH /api/progress/podcast`

**Body**
```json
{ "podcastId": "clx...", "currentSeconds": 512, "durationSeconds": 5040, "completed": false }
```
Same field rules as the watch route above.

**200** `{ "ok": true }`

**Errors**: `401`, `400 { "error": "Invalid JSON." }`, `400 { "error": "podcastId required." }`, `400 { "error": "currentSeconds must be a non-negative number." }`, `404 { "error": "Podcast not found." }`.

---

## Building a "Continues Watching" row

⚠️ **`GET /api/progress/watch` does not include `thumbnailUrl`, `durationLabel`,
or instructor name** — just `lessonId`, seconds, and the lesson's
`{ videoId, order, title }`. To render the card shown in the app (thumbnail,
author name, progress bar), cross-reference each `videoId` against
`GET /api/videos/{id}` (or `GET /api/public/videos/{id}` for a guest-visible
version) to get `thumbnailUrl` and `instructor`. There's no single endpoint
that returns the fully joined "Continues Watching" shape today — say the
word if you want one added (e.g. `GET /api/progress/watch/detailed`) instead
of doing the join client-side.

`progressPct` for the bar is `currentSeconds / durationSeconds * 100`,
computed client-side — it's not returned directly by the API.
