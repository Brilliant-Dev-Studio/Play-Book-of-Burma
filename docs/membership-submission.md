# Membership Submission — User API

Base URL: `https://playbookofburma.com`  
Auth: Not required for any of these endpoints.

---

## Flow Overview

```
1. POST /api/membership/sign-screenshot  →  get presigned S3 URL
2. PUT {url}                             →  upload screenshot to S3
3. POST /api/membership/submit           →  submit application
```

---

## Step 1 — Get Presigned Upload URL

**`POST /api/membership/sign-screenshot`**

### Request

```json
{
  "filename":    "payment.jpg",
  "contentType": "image/jpeg"
}
```

| Field         | Required | Values                                                        |
|---------------|----------|---------------------------------------------------------------|
| `filename`    | ✓        | Any string with a valid image extension                       |
| `contentType` | ✓        | `image/jpeg` · `image/png` · `image/webp` · `image/heic` · `image/heif` |

### Response `200 OK`

```json
{
  "method":  "PUT",
  "url":     "https://s3.amazonaws.com/...?X-Amz-Signature=...",
  "key":     "playbookofburma/submissions/1720000000000-payment.jpg",
  "headers": { "Content-Type": "image/jpeg" }
}
```

> **Note:** The presigned URL expires in **15 minutes**. Complete Steps 2 and 3 before it expires.

---

## Step 2 — Upload Screenshot to S3

```
PUT {url}
Content-Type: {contentType from Step 1}
Body: <binary image bytes>
```

No response body. HTTP `200` = success.

---

## Step 3 — Submit Application

**`POST /api/membership/submit`**

### Request

```json
{
  "fullName":      "Ko Aung Aung",
  "email":         "aung@example.com",
  "phone":         "09xxxxxxxxx",
  "plan":          "SIX_MONTHS",
  "paymentMethod": "KBZ_PAY",
  "screenshotKey": "playbookofburma/submissions/1720000000000-payment.jpg",
  "note":          "Paid via KBZ app"
}
```

| Field           | Required | Rules                              |
|-----------------|----------|------------------------------------|
| `fullName`      | ✓        | Max 120 characters                 |
| `email`         | ✓        | Valid email format, lowercased     |
| `phone`         | ✓        | Max 30 characters                  |
| `plan`          | ✓        | `SIX_MONTHS` or `TWELVE_MONTHS`   |
| `paymentMethod` | ✓        | `KBZ_PAY` or `WAVE_MONEY`         |
| `screenshotKey` | ✓        | `key` value returned from Step 1  |
| `note`          | —        | Optional, max 500 characters       |

### Response `200 OK`

```json
{
  "ok": true,
  "id": "cuid_..."
}
```

### Error Responses

| Status | Cause                                      |
|--------|--------------------------------------------|
| `400`  | Missing / invalid field                    |
| `400`  | `screenshotKey` prefix mismatch            |
| `400`  | Invalid `plan` or `paymentMethod` value    |

---

## Plan Prices

| `plan`           | Price (MMK) |
|------------------|-------------|
| `SIX_MONTHS`     | 180,000     |
| `TWELVE_MONTHS`  | 360,000     |

---

## After Submission

1. Application status is **PENDING**.
2. Admin reviews the payment screenshot manually.
3. On **approval** — a welcome email is sent with a temporary password.
4. User logs in with the temporary password.
5. User is immediately redirected to **change password** (`mustChangePassword: true`).
