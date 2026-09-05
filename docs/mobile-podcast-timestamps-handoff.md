# Mobile Integration — Podcast Audio Player + Timestamps

Handoff doc for the mobile app. Backend work is done and live. This covers
everything needed to bind the audio detail screen (thumbnail, title, player,
description, tappable timestamps list) to real data.

## What changed

Superadmin can now enter chapter/timestamp markers per podcast episode from
the web dashboard (label + `mm:ss`, e.g. `2:23` — "Foods to Eat to Improve
Gut Health"). Two new API endpoints expose them, ordered, as a `chapters`
array. Tapping a row in the mobile UI should seek the audio player to that
row's `seconds`.

## Base URL

```
https://www.playbookofburma.com
```

## Auth

Login already returns a bearer token:

```
POST /api/auth/login
Content-Type: application/json

{ "email": "...", "password": "..." }
```

**200** → `{ "token": "<jwt>", ... }` (also sets an httpOnly cookie for web,
irrelevant to mobile). Store `token` and send it on every authenticated
request:

```
Authorization: Bearer <token>
```

Token is a JWT, 14-day expiry. No refresh endpoint exists yet — re-login when
expired (a `401` response is the signal).

## Endpoints

### `GET /api/podcasts/{id}` — member-only (use this for the logged-in app)

```
GET https://www.playbookofburma.com/api/podcasts/{id}
Authorization: Bearer <token>
```

**200**
```json
{
  "podcast": {
    "id": "clx...",
    "title": "CFO of BYD by Essential Motors",
    "description": "Lorem ipsum...",
    "thumbnailUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-...",
    "audioUrl": "https://<bucket>.s3.../podcasts/...?X-Amz-...",
    "durationLabel": "1 hour 24 minutes",
    "durationSeconds": 5040,
    "chapters": [
      { "label": "How A Thriving Gut Can Unlock Your Health", "seconds": 0 },
      { "label": "Foods to Eat to Improve Gut Health", "seconds": 143 },
      { "label": "The Link Between Your Gut and Immune System", "seconds": 477 }
    ]
  }
}
```

**Errors**
| Status | Body | Meaning |
|---|---|---|
| 401 | `{ "error": "Unauthenticated." }` | Missing/invalid/expired token — send back to login |
| 403 | `{ "error": "Active membership required." }` | Logged in, but no active paid membership |
| 404 | `{ "error": "Podcast not found." }` | Bad id, or episode not published |

### `GET /api/public/podcasts/{id}` — no auth (guest preview only)

Identical response shape, no `Authorization` header. Use only for a
pre-login "preview" screen if the app has one — the real in-app player
should use the member route above.

## Field → UI mapping

| Screen element (see mockup) | Field |
|---|---|
| Thumbnail image | `thumbnailUrl` |
| Title | `title` |
| Player audio source | `audioUrl` |
| Total duration shown next to scrubber | `durationLabel` / `durationSeconds` |
| "Description:" block | `description` |
| "Timestamps:" list, e.g. `(00:00) How A Thriving Gut...` | `chapters[]` — render each row as `(mm:ss) label`, computed client-side from `seconds` |

## Timestamp tap behavior

`chapters` is already sorted ascending by `seconds`. On row tap:

```
player.seekTo(chapters[i].seconds)   // pseudocode — use your player SDK's seek/currentTime API
```

No separate seek API call needed — this is entirely client-side once you
have `audioUrl` loaded into the player.

## Resume playback (separate, existing endpoint — optional)

If the app wants to resume where the user left off (not the chapter list,
a per-user "last position"):

```
GET /api/progress/podcast
Authorization: Bearer <token>
```
→ `{ "progress": [{ "podcastId", "currentSeconds", "durationSeconds", "completedAt", "lastListenedAt" }] }`

```
PATCH /api/progress/podcast
Authorization: Bearer <token>
Content-Type: application/json

{ "podcastId": "...", "currentSeconds": 143, "durationSeconds": 5040, "completed": false }
```
→ `{ "ok": true }` — call periodically (e.g. every 10-15s) while playing.

## Notes

- All media URLs (`thumbnailUrl`, `audioUrl`) are S3 presigned URLs with an
  expiry (a few hours) — don't cache them long-term, refetch the detail
  endpoint if a URL 403s.
- `chapters` can be an empty array `[]` — hide the Timestamps section
  entirely when empty, don't show a blank list.
