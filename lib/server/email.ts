import "server-only";

export async function sendWelcomeEmail(
  to: string,
  tempPassword: string,
  displayName?: string | null,
): Promise<void> {
  console.log("\n[WELCOME EMAIL MOCK] ─────────────────────");
  console.log(`  To           : ${to}`);
  if (displayName) console.log(`  Display Name : ${displayName}`);
  console.log(`  Temp Password: ${tempPassword}`);
  console.log("  Note         : User must change this on first login.");
  console.log("──────────────────────────────────────────\n");
}

export async function sendResetCodeEmail(to: string, code: string, expiry: Date): Promise<void> {
  console.log("\n[RESET OTP EMAIL MOCK] ────────────────────");
  console.log(`  To    : ${to}`);
  console.log(`  Code  : ${code}`);
  console.log(`  Expiry: ${expiry.toISOString()}`);
  console.log("───────────────────────────────────────────\n");
}
