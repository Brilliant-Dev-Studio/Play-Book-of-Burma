# Mobile Integration — Membership Plans (Pricing)

Handoff doc for the mobile app. Backend work is done and live. Covers the
plan/pricing catalog shown on the "Choose Monthly Membership" screen.

## Base URL

```
https://www.playbookofburma.com
```

## Endpoint

### `GET /api/public/plans`

Public — no auth, no `Authorization` header needed. Same data + ordering as
the web "Choose Monthly Membership" pricing page, so the mobile pricing
screen always matches the website.

```
GET https://www.playbookofburma.com/api/public/plans
```

**200**
```json
{
  "plans": [
    {
      "key": "SIX_MONTHS",
      "name": "6 Months",
      "months": 6,
      "priceMmk": 180000,
      "perks": ["Full library access", "New playbooks every month", "1 device sign-in"],
      "featured": true
    },
    {
      "key": "TWELVE_MONTHS",
      "name": "12 Months",
      "months": 12,
      "priceMmk": 360000,
      "perks": ["Full library access", "New playbooks every month", "1 device sign-in", "Best value"],
      "featured": false
    }
  ]
}
```

Array is pre-sorted — render in the order returned, don't re-sort
client-side. Only active plans are included (an inactive/retired tier just
won't appear).

## Field → UI mapping

| Screen element | Field |
|---|---|
| Plan tier title ("6 Months" / "12 Months") | `name` |
| "MOST POPULAR" badge | `featured` (show badge when `true`) |
| Price line ("180,000 MMK") | `priceMmk` — format with thousands separators, append `" MMK"` |
| "/ 6 months" subtext | `months` |
| Bullet list (Full library access, …) | `perks[]` — render each as a checkmark row, in array order |
| Which plan to submit on "Join" | `key` — pass this exact value (`"SIX_MONTHS"` / `"TWELVE_MONTHS"`) as `plan` in `POST /api/membership/submit` |

## Notes

- No auth — safe to call on app launch / before login for a pricing/paywall
  screen.
- `priceMmk` is a plain integer (no formatting) — do all display formatting
  client-side.
- This endpoint only returns pricing metadata, not a subscribe/checkout
  action. Joining is a separate manual-approval flow — see the
  `POST /api/membership/submit` + `POST /api/membership/sign-screenshot`
  routes in `docs/API.md` if wiring the join flow too.
