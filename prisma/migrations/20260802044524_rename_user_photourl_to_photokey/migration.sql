-- Rename User.photoUrl to User.photoKey.
-- The old column held presigned S3 GET URLs (4h TTL), which is why photos
-- silently stopped loading after a few hours — not a valid S3 key, so it
-- can't be reused as one. Clearing existing values here; going forward the
-- app stores the permanent S3 key and presigns a fresh URL on every read.
ALTER TABLE "User" RENAME COLUMN "photoUrl" TO "photoKey";
UPDATE "User" SET "photoKey" = NULL WHERE "photoKey" IS NOT NULL;
