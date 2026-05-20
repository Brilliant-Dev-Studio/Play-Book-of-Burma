import "server-only";
import { randomBytes } from "crypto";

const POOL =
  "abcdefghijkmnopqrstuvwxyz" +
  "ABCDEFGHJKLMNPQRSTUVWXYZ" +
  "23456789" +
  "!@#$%^&*";

export function generateTempPassword(length = 12): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += POOL[bytes[i] % POOL.length];
  }
  return out;
}
