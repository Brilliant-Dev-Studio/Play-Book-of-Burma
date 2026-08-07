# Membership Plans — Admin-Managed

Admin can now edit the price, display name, and perks of the two membership
tiers from `/admin/plans` — changes go live immediately on the public
`/membership` page and on new submission pricing. No deploy needed.

## Scope (by design)

The two tiers themselves — `SIX_MONTHS` and `TWELVE_MONTHS` — stay fixed.
They're baked into a Prisma **enum** (`MembershipPlan`) that
`Membership`/`MembershipSubmission` key off directly, and changing that to a
free-form relation would mean touching the submission form, the admin
approve flow, and every doc that references plan keys. What admin *can*
change per tier: `name`, `months`, `priceMmk`, `perks`, `featured`,
`isActive`. Adding a third tier (e.g. "3 Months") isn't supported by this —
say so if you need that, it's a bigger change (see the "what's fixed" note
in [schema.prisma](../prisma/schema.prisma) next to the `Plan` model).

## Data model

```prisma
model Plan {
  id        String         @id @default(cuid())
  key       MembershipPlan @unique   // SIX_MONTHS | TWELVE_MONTHS
  name      String                   // "6 Months"
  months    Int                      // 6
  priceMmk  Int                      // 180000
  perks     String[]                 // bullet list on the pricing card
  featured  Boolean        @default(false)
  isActive  Boolean        @default(true)
  sortOrder Int            @default(0)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}
```
Seeded with the two tiers on migration — see the "seed" step in the PR that
introduced this, or re-run it if a fresh DB is missing rows (`prisma.plan`
is empty → `/membership` renders no cards).

## Admin UI

`/admin/plans` — two cards (one per tier), each with its own form: name,
months, price (MMK), perks (one per line), featured toggle, active toggle,
Save button. Reachable from the admin sidebar ("Plans"). Uses a Server
Action (`savePlan` in
[app/admin/plans/actions.ts](../app/admin/plans/actions.ts)), not the REST
API below — same as most other admin CRUD screens in this app.

## REST API (admin only)

All three require session + `role === "ADMIN"` — `401`/`403` otherwise.
Base domain: `https://www.playbookofburma.com`.

### `GET /api/admin/plans`
List both tiers (active and inactive).
```
GET https://www.playbookofburma.com/api/admin/plans
Authorization: Bearer <token>
```
**200**
```json
{
  "plans": [
    { "id": "cm...", "key": "SIX_MONTHS", "name": "6 Months", "months": 6, "priceMmk": 180000, "perks": ["Full library access", "New playbooks every month", "1 device sign-in"], "featured": true, "isActive": true, "sortOrder": 0, "createdAt": "...", "updatedAt": "..." },
    { "id": "cm...", "key": "TWELVE_MONTHS", "name": "12 Months", "months": 12, "priceMmk": 360000, "perks": ["...", "Best value"], "featured": false, "isActive": true, "sortOrder": 1, "createdAt": "...", "updatedAt": "..." }
  ]
}
```

### `GET /api/admin/plans/{key}`
One tier. `{key}` is `SIX_MONTHS` or `TWELVE_MONTHS`.
```
GET https://www.playbookofburma.com/api/admin/plans/SIX_MONTHS
Authorization: Bearer <token>
```
**200** `{ "plan": { ...same shape as above... } }`
**Errors**: `400` bad key, `404` (shouldn't happen post-seed).

### `PATCH /api/admin/plans/{key}`
Partial update — send only the fields you're changing.
```
PATCH https://www.playbookofburma.com/api/admin/plans/SIX_MONTHS
Authorization: Bearer <token>
Content-Type: application/json

{ "priceMmk": 200000, "perks": ["Full library access", "New playbooks every month", "1 device sign-in", "Priority support"] }
```
**200** `{ "plan": { ...updated row... } }`
**Errors**: `400` invalid key or invalid field value, `400 { "error": "No fields to update." }` (empty body).

Editable fields: `name` (string), `months` (positive int), `priceMmk`
(non-negative int), `perks` (string array), `featured` (bool), `isActive`
(bool).

### `POST /api/admin/plans`
Upsert-by-key, not "create a new tier" — `key` must be one of the two fixed
values. Mainly useful for reseeding if a row is somehow missing; day-to-day
editing should use `PATCH` above.
```
POST https://www.playbookofburma.com/api/admin/plans
Authorization: Bearer <token>
Content-Type: application/json

{ "key": "SIX_MONTHS", "name": "6 Months", "months": 6, "priceMmk": 180000, "perks": ["..."], "featured": true, "isActive": true }
```
**201** `{ "plan": { ... } }`
**409** `{ "error": "Plan already exists for this key. Use PATCH /api/admin/plans/{key} to edit it." }` — expected in normal operation since both keys are seeded already.

## What changed elsewhere

- **`GET /membership`** (public page) now renders real price + perks from
  the `Plan` table instead of a hardcoded lorem-ipsum placeholder card grid.
  The old fake "Standard" (free) tier is gone — only the two real,
  DB-backed tiers show.
- **`POST /api/membership/submit`** now looks up `amountMmk` from the `Plan`
  table (falls back to the old hardcoded constant in
  [lib/server/pricing.ts](../lib/server/pricing.ts) only if a `Plan` row is
  somehow missing) — a price change in `/admin/plans` affects the very next
  submission, no redeploy needed.
