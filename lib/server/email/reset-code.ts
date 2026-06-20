import { send } from "./client";
import { shell } from "./shell";

const F = "'Poppins',Arial,Helvetica,sans-serif";

export async function sendResetCodeEmail(to: string, code: string, expiry: Date): Promise<void> {
  const subject   = "Your Playbook of Burma password reset code";
  const expiryStr = expiry.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Yangon",
  });

  const body = `
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 20px;">
      <div style="font-family:${F};font-size:15px;font-weight:600;
                  color:#151515;line-height:150%;letter-spacing:-0.1px;">
        Hi there,
      </div>
    </td>
  </tr>
</table>

<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 28px;">
      <div style="font-family:${F};font-size:15px;font-weight:400;
                  color:#444;line-height:170%;letter-spacing:-0.1px;">
        We received a request to reset the password for your Playbook of Burma account.
        Use the code below to continue — it expires at
        <strong style="color:#151515;font-weight:600;">${expiryStr} MMT</strong>.
        If you didn't request this, you can safely ignore this email.
      </div>
    </td>
  </tr>
</table>

<!-- OTP label -->
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 10px;">
      <div style="font-family:${F};font-size:11px;font-weight:600;
                  letter-spacing:0.1em;text-transform:uppercase;color:#aaa;">
        Your Reset Code
      </div>
    </td>
  </tr>
</table>

<!-- OTP display -->
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
       style="margin-bottom:12px;">
  <tr>
    <td style="padding:28px 20px;background:#f8f8f8;border:1.5px solid #e4e4e4;
               border-radius:8px;text-align:center;">
      <span style="font-family:'Courier New',Courier,monospace;font-size:44px;font-weight:800;
                   letter-spacing:16px;color:#151515;line-height:1;display:block;">
        ${code}
      </span>
    </td>
  </tr>
</table>

<!-- Notice -->
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
       style="margin-bottom:28px;">
  <tr>
    <td style="padding:13px 20px;background:#f8f8f8;border:1px solid #e4e4e4;border-radius:6px;
               text-align:center;font-family:${F};font-size:13px;font-weight:400;
               color:#888;line-height:1.75;">
      This code is valid for a single use only.
      Never share it with anyone.
    </td>
  </tr>
</table>`;

  const text = [
    "Hi there,",
    "",
    "We received a request to reset your Playbook of Burma password.",
    "",
    `Reset code: ${code}`,
    `Expires at: ${expiryStr} MMT`,
    "",
    "This code is valid for a single use only. Never share it with anyone.",
    "",
    "If you didn't request this, you can safely ignore this email.",
  ].join("\n");

  await send(to, subject, shell(body), text);
}
