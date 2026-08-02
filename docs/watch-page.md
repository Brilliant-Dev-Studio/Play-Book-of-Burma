# `/user-portal/watch` — Endpoints Used

**This page doesn't call any `/api/*` REST route.** It's a Next.js Server
Component ([app/user-portal/watch/page.tsx](../app/user-portal/watch/page.tsx))
that queries Prisma directly, plus three Server Actions
([app/user-portal/watch/actions.ts](../app/user-portal/watch/actions.ts)) for
the interactive bits (bookmark, note, progress). Server Actions are
Next.js-internal RPC calls — they only work from this web app's own client
JS, not from a mobile app or any external caller.

For mobile, use the REST equivalents below — same effect, reachable over
HTTP with `Authorization: Bearer <token>`.

## Page load

| What the page does | REST equivalent |
|---|---|
| Video + lessons + instructor | `GET /api/videos/{id}` — see [video.md](video.md) |
| This lesson's bookmark state | `GET /api/bookmarks` (check if `lessonId` is in the list) |
| This lesson's saved note | `GET /api/notes/{lessonId}` |
| Watch progress (resume position) | `GET /api/progress/watch` (find the entry for `lessonId`) |
| Playable video for the active lesson | `GET /api/videos/{id}/lessons/{lessonId}` |

The web page joins all of these into one server-rendered payload; over REST
that's 4–5 separate calls. See [API.md](API.md) for exact shapes.

## Interactions

| Server Action | REST equivalent |
|---|---|
| `toggleBookmark(lessonId)` | `POST /api/bookmarks { lessonId }` to add, `DELETE /api/bookmarks/{lessonId}` to remove |
| `saveNote(lessonId, content)` | `PUT /api/notes/{lessonId} { content }` (empty `content` deletes it) |
| `saveWatchProgress(lessonId, currentSeconds, durationSeconds)` | `PATCH /api/progress/watch { lessonId, currentSeconds, durationSeconds }` — see [progress.md](progress.md) |

## Playbook-completion achievement

`PATCH /api/progress/watch` now awards it too (ported 2026-08-02) — when a
`PATCH` transitions a lesson from not-completed to `completed: true`, the
route checks whether *every* lesson in that video is now complete and, if
so, upserts a `PlaybookAchievement` row (feeds the "My Progress" achievements
list). Same logic as the web Server Action's `maybeAwardPlaybook()`, kept as
a duplicate in [route.ts](../app/api/progress/watch/route.ts) rather than a
shared import (the web action and the REST route are different runtimes).

**Mobile must send `completed: true` explicitly** on the call where the
lesson finishes — unlike the web player, the REST route doesn't infer
completion from `currentSeconds`/`durationSeconds` on its own. A reasonable
client-side rule matching the web behavior: mark `completed: true` once
`currentSeconds >= durationSeconds - 5` or `currentSeconds / durationSeconds >= 0.95`.
