# Podcast Detail — Timestamps / Chapter Markers

Two routes back the audio episode detail screen (thumbnail, title, player,
description, tappable "Timestamps" list):

- **`GET /api/public/podcasts/{id}`** — no auth, guest/pre-login preview.
- **`GET /api/podcasts/{id}`** — requires session + active membership, used
  once the user is logged in.

Both return the same shape, including a `chapters` array — superadmin enters
these as label + `mm:ss` rows on the podcast's admin edit page. Tapping a row
on mobile should seek the audio player to `chapters[i].seconds`.

## `GET /api/public/podcasts/{id}`

No `Authorization` header needed.

```
GET https://www.playbookofburma.com/api/public/podcasts/{id}
```

**200**
```json
{
  "podcast": {
    "id": "clx...",
    "title": "CFO of BYD by Essential Motors",
    "description": "...",
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

**404** `{ "error": "Podcast not found." }`

## `GET /api/podcasts/{id}` (member-only)

```
GET https://www.playbookofburma.com/api/podcasts/{id}
Authorization: Bearer <token>
```

Same response shape as above.

**Errors**: `401 { "error": "Unauthenticated." }`, `403 { "error": "Active membership required." }`, `404 { "error": "Podcast not found." }`.

### Seeking to a timestamp

`chapters[]` is already ordered. On the client, tapping a row is just:

```
player.seekTo(chapters[i].seconds)
```

(the web app's equivalent is `seekTo(sec)` in
`app/user-portal/podcast-player-context.tsx`).

### Admin entry

Superadmin adds/edits rows under "Timestamps (optional)" on the podcast
create/edit form (`/admin/podcasts/new`, `/admin/podcasts/{id}`) — one text
input for the label, one for time as `mm:ss` (e.g. `2:23`). Rows are stored
ordered and re-fetched into the same `mm:ss` display on edit.
