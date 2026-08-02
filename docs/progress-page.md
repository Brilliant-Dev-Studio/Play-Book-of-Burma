# `/user-portal/progress` — Endpoints Used

Same pattern as [watch-page.md](watch-page.md): the actual Next.js page
([app/user-portal/progress/page.tsx](../app/user-portal/progress/page.tsx))
doesn't call any `/api/*` route — it's a Server Component querying Prisma
directly, joining 4 things: bookmarks, notes, in-progress lessons
("Continues Watching"), and completed playbooks ("achievements").

**Unlike the watch page, REST coverage here is incomplete** — two of the
four sections have no backing endpoint at all, and the two that exist are
missing fields the page needs. Details below.

Base domain: `https://www.playbookofburma.com`. All calls need
`Authorization: Bearer <token>`.

---

## 1. Bookmarks — partial coverage

Page needs: `videoId, lessonId, thumbnailUrl, durationLabel, instructorName, videoTitle, lessonOrder, totalLessons`.

### `GET /api/bookmarks` (exists)
```
GET https://www.playbookofburma.com/api/bookmarks
Authorization: Bearer <token>
```
**200**
```json
{
  "bookmarks": [
    { "lessonId": "clx...", "lessonTitle": "What is Lorem Ipsum?", "lessonOrder": 0, "lessonDuration": "12 minutes 13 seconds", "videoId": "clx...", "videoTitle": "Learn Finance...", "bookmarkedAt": "2026-08-01T10:00:00.000Z" }
  ]
}
```
**Missing vs. what the page renders**: `thumbnailUrl`, `instructorName`,
`totalLessons` (lesson count for "Lesson N of M"). Cross-reference each
`videoId` against `GET /api/videos/{id}` to fill those in client-side, or
ask for the endpoint to be extended.

---

## 2. Notes — no bulk endpoint

Page needs a list of **all** the user's notes across every lesson, most
recently updated first, each with a text preview + video/instructor context.

### Only `GET /api/notes/{lessonId}` exists (per-lesson, not a list)
There's no `GET /api/notes` that returns every note for the user — you'd
have to already know every `lessonId` the user has notes on, which nothing
else exposes either. **This section has no REST path today.**

---

## 3. Continues Watching — partial coverage

Page needs: `videoId, lessonId, thumbnailUrl, durationLabel, progressPct, author, subtitle` — only in-progress (not completed, `currentSeconds > 0`), most recent first, capped at 12.

### `GET /api/progress/watch` (exists, see [progress.md](progress.md))
```
GET https://www.playbookofburma.com/api/progress/watch
Authorization: Bearer <token>
```
**200**
```json
{
  "progress": [
    { "lessonId": "clx...", "currentSeconds": 996, "durationSeconds": 1440, "completedAt": null, "lastWatchedAt": "2026-08-01T10:22:00.000Z", "lesson": { "videoId": "clx...", "order": 1, "title": "..." } }
  ]
}
```
**Missing vs. what the page renders**: no `thumbnailUrl`, no
`instructorName`/`totalLessons` for the subtitle, and it returns *all*
progress (including completed) rather than only in-progress — filter
`completedAt === null && currentSeconds > 0` client-side, sort by
`lastWatchedAt` desc, take 12. Cross-reference `videoId` against
`GET /api/videos/{id}` for thumbnail/instructor, same as bookmarks above.
`progressPct = currentSeconds / durationSeconds * 100`, computed client-side.

---

## 4. Playbook Achievements — no endpoint at all

Page needs: completed playbooks (videos where every lesson is `completed`),
each with `videoId, thumbnailUrl, titleLine1, titleLine2, instructorName, instructorTitle, durationLabel`, most recently achieved first.

**No `/api/*` route reads `PlaybookAchievement` today.** `PATCH
/api/progress/watch` *writes* to it (awards on lesson completion, see
[watch-page.md](watch-page.md#playbook-completion-achievement)) but nothing
reads the list back. **This section has no REST path today.**

---

## What to do about the two missing sections

Two options, same as flagged elsewhere in these docs:
1. Cheapest: have mobile skip these two sections (or show them empty) until endpoints exist.
2. Add `GET /api/notes` (all notes, joined) and `GET /api/progress/achievements` (playbook achievement list, joined) — mirroring the shapes above. Straightforward additions, same pattern as the other `/api/progress/*` and `/api/bookmarks` routes.

Say the word and I'll build both, plus extend `GET /api/bookmarks` and
`GET /api/progress/watch` with the missing joined fields so this whole page
can be built from REST alone without extra client-side cross-referencing.
