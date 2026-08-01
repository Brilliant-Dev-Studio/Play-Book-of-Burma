# Landing Page Feed — Popular / Newly Added Videos & Podcast Teaser

The two sections on the public marketing homepage (`app/page.tsx`) — the
Popular/Newly Added video cards and the "Listen to Story of Burma Podcast
with No Ads" section — are **not backed by a public REST endpoint today**.
They're rendered server-side in the Next.js page directly from Prisma
([lib/server/popular-videos.ts](../lib/server/popular-videos.ts),
[lib/server/podcasts.ts](../lib/server/podcasts.ts)), with no session check.

That means: **if the mobile app's home/landing screen needs this same data
before login, there is currently no GET API to call for it.**
`GET /api/videos` and `GET /api/podcasts` both require an authenticated
session + active membership (see [API.md](API.md)) — they are not the source
of this section and will `401`/`403` for a logged-out user.

Below is the exact shape this data would have if exposed as a GET API, taken
directly from the functions the landing page calls. Treat this as a spec to
implement, not a live endpoint.

## Popular videos

Source: `getPopularVideos(take = 12)` — ranked by watch-session count across
all users, padded with most-recently-published if there aren't enough
watched videos yet.

Proposed: `GET /api/public/videos/popular?take=12`

```json
{
  "videos": [
    {
      "id": "clx...",
      "titleLine1": "How to Extend Your Financial",
      "titleLine2": "Runway for 6 Months",
      "instructorName": "Ko Jason Myint",
      "instructorTitle": "CEO - BYD By Essentail",
      "description": "...",
      "duration": "12 minutes 13 seconds",
      "durationSeconds": 733,
      "publishedAt": "2026-06-01T00:00:00.000Z",
      "thumbnailUrl": "https://<bucket>.s3.../thumbnails/...?X-Amz-..."
    }
  ]
}
```

## Newly added videos

Source: `getNewlyAddedVideos(take = 12)` — most recently published, newest
first. Same item shape as above.

Proposed: `GET /api/public/videos/newly-added?take=12`

## Podcast teaser ("Listen to Story of Burma Podcast with No Ads")

Source: `getHomePodcastGroups()` — same shape as the authenticated podcast
list (`GET /api/podcasts`), grouped by `"Popular"` / `"Season N"`.

Proposed: `GET /api/public/podcasts`

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
          "durationSeconds": 1440
        }
      ]
    }
  ]
}
```

## Notes

- `thumbnailUrl` / `audioUrl` are S3 **presigned GET URLs** with a TTL
  (`PRESIGN_TTL.image` = 4h, `PRESIGN_TTL.video` = 6h — see
  [lib/server/s3.ts](../lib/server/s3.ts)). A mobile client should treat
  them as short-lived and re-fetch the list rather than caching URLs
  long-term.
- **Full `audioUrl` is already included in the podcast teaser** on the
  public landing page today — meaning the "No Ads" podcast preview is
  actually fully playable audio, not a locked/teaser stream. Worth
  double-checking that's intentional before mirroring it into the app.
- None of this requires `Authorization: Bearer <token>` if/when exposed —
  it's public marketing content by design (same as the current web landing
  page).

If you want these wired up as real endpoints for the mobile app, say so and
I'll add `app/api/public/videos/popular/route.ts`,
`app/api/public/videos/newly-added/route.ts`, and
`app/api/public/podcasts/route.ts` reusing the existing lib functions
verbatim.
