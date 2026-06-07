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

// Ready to wire to AWS SES once a domain is purchased. Not called yet — the
// playbook award flow leaves emailSentAt null until this is hooked up.
export async function sendPlaybookAchievedEmail(
  to: string,
  playbookTitle: string,
  displayName?: string | null,
): Promise<void> {
  console.log("\n[PLAYBOOK ACHIEVED EMAIL MOCK] ────────────");
  console.log(`  To           : ${to}`);
  if (displayName) console.log(`  Display Name : ${displayName}`);
  console.log(`  Playbook     : ${playbookTitle}`);
  console.log("──────────────────────────────────────────\n");
}
