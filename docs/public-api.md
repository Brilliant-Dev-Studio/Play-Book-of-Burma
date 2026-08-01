# Public API — No Auth Required

Unauthenticated routes for pre-login browse screens (landing page, mobile
"browse before you join"). No `Authorization` header, no session cookie, no
membership needed. Separate files from the members-only routes — the
originals (`/api/videos`, `/api/podcasts`) are untouched and still require
login + active membership as documented in [API.md](API.md).

Base domain: `https://www.playbookofburma.com` (not the apex — see
[mobile-integration.md](mobile-integration.md)).

## `GET /api/public/videos`

Published videos, optionally filtered by industry/skillset, paginated.

**Query params**
| Param | Type | Default | Notes |
|---|---|---|---|
| `industry` | string | — | filter by `Industry.name`, exact match |
| `skillset` | string | — | filter by `Skillset.name`, exact match |
| `sort` | `"popular" \| "newest"` | `"newest"` | accepted but both currently sort `publishedAt desc, createdAt desc` — same behavior as the private route |
| `page` | integer | `1` | |
| `limit` | integer | `12` | max `50` |

**Example**
```
GET /api/public/videos?industry=CEO&sort=newest&page=1&limit=12
```

**200**
```json
{
  "videos": [
    {
      "id": "clx...",
      "titleLine1": "How to Extend Your Financial",
      "titleLine2": "Runway for 6 Months",
      "description": "...",
      "thumbnailUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-...",
      "durationLabel": "12 minutes 13 seconds",
      "durationSeconds": 733,
      "publishedAt": "2026-06-01T00:00:00.000Z",
      "industry": "CEO",
      "skillset": "Finance",
      "instructorName": "Ko Jason Myint",
      "instructorTitle": "CEO - BYD By Essentail"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 12
}
```
No lessons/trailer/video URLs here — this is the browse-card shape only.
Watching a lesson still requires login + membership (`GET /api/videos/{id}`,
`GET /api/videos/{id}/lessons/{lessonId}`).

## `GET /api/public/videos/random`

N random published videos — for shuffled browse screens like "Watch All the
Playbooks". Different order/pick on every call.

**Query params**
| Param | Type | Default | Notes |
|---|---|---|---|
| `limit` | integer | `12` | max `50` |

**Example**
```
GET /api/public/videos/random?limit=12
```

**200** — same item shape as `GET /api/public/videos`:
```json
{
  "videos": [
    {
      "id": "clx...",
      "titleLine1": "Learn Finance in 21 Day, Become",
      "titleLine2": "Master at it",
      "description": "...",
      "thumbnailUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-...",
      "durationLabel": "1 hour 15 minutes",
      "durationSeconds": 4500,
      "publishedAt": "2026-04-01T00:00:00.000Z",
      "industry": "Finance",
      "skillset": "Investing",
      "instructorName": "Ko Jason Myint",
      "instructorTitle": "CEO of BYD By Essentials"
    }
  ]
}
```
No `total`/`page`/`limit` in the response — it's a single shuffled batch, not
a paginated list. Call it again for a fresh shuffle.

## `GET /api/public/podcasts`

All podcasts, grouped by `"Popular"` / `"Season N"` — identical shape to the
authenticated `GET /api/podcasts`, including playable `audioUrl`.

**200**
```json
{
  "groups": [
    {
      "label": "Popular",
      "items": [
        {
          "id": "clx...",
          "title": "Episode title",
          "description": "...",
          "thumbnailUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-...",
          "audioUrl": "https://<bucket>.s3.../podcasts/...?X-Amz-...",
          "durationLabel": "24 minutes",
          "durationSeconds": 1440,
          "season": 1,
          "publishedAt": "2026-05-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```
`{ "groups": [] }` if there are no podcasts yet.

## Notes

- Both routes are read-only, no side effects — safe to call as often as
  needed, but `thumbnailUrl`/`audioUrl` are S3 presigned URLs
  (`PRESIGN_TTL.image` = 4h, `PRESIGN_TTL.video` = 6h) — re-fetch the list
  rather than caching URLs past that window.
- CORS: same policy as the rest of `/api/*` — see `proxy.ts`. Native app
  calls (`URLSession`) aren't affected by CORS at all; only relevant for a
  browser-based caller.
- The private routes (`/api/videos`, `/api/podcasts`) were not modified —
  their auth/membership checks are exactly as before.
