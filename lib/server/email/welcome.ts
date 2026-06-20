import { send, SITE } from "./client";
import { shell } from "./shell";

const F = "'Poppins',Arial,Helvetica,sans-serif";

export async function sendWelcomeEmail(
  to: string,
  tempPassword: string,
  displayName?: string | null,
): Promise<void> {
  const name    = displayName ?? "there";
  const subject = `Welcome to Playbook of Burma, ${name}!`;

  const body = `
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 20px;">
      <div style="font-family:${F};font-size:15px;font-weight:600;
                  color:#151515;line-height:150%;letter-spacing:-0.1px;">
        Hi ${name},
      </div>
    </td>
  </tr>
</table>

<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 8px;">
      <div style="font-family:${F};font-size:15px;font-weight:400;
                  color:#444;line-height:170%;letter-spacing:-0.1px;">
        Your membership has been approved. You now have full access to
        <strong style="color:#151515;font-weight:600;">Playbook of Burma</strong> —
        Myanmar's platform for learning from the country's top founders, CEOs,
        and business leaders.
      </div>
    </td>
  </tr>
</table>

<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 28px;">
      <div style="font-family:${F};font-size:15px;font-weight:400;
                  color:#444;line-height:170%;letter-spacing:-0.1px;">
        Use the credentials below to sign in and get started.
      </div>
    </td>
  </tr>
</table>

<!-- Credentials card -->
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
       style="background:#f8f8f8;border-radius:8px;border:1px solid #e4e4e4;
              overflow:hidden;margin-bottom:12px;">
  <tr>
    <td style="padding:14px 20px;border-bottom:1px solid #e4e4e4;">
      <div style="font-family:${F};font-size:11px;font-weight:600;
                  letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin-bottom:5px;">
        Email Address
      </div>
      <div style="font-family:${F};font-size:15px;font-weight:500;color:#151515;">
        <span style="color:#151515!important;text-decoration:none!important;">${to}</span>
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px 20px 18px;">
      <div style="font-family:${F};font-size:11px;font-weight:600;
                  letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin-bottom:12px;">
        Temporary Password
      </div>
      <div style="text-align:center;">
        <span style="font-family:'Courier New',Courier,monospace;font-size:26px;
                     font-weight:700;letter-spacing:6px;color:#151515;line-height:1;">
          ${tempPassword}
        </span>
      </div>
    </td>
  </tr>
</table>

<!-- Warning -->
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
       style="background:#fffdf0;border:1px solid #f0e08a;border-radius:6px;margin-bottom:32px;">
  <tr>
    <td style="padding:12px 16px;">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="vertical-align:top;padding-right:9px;font-size:14px;line-height:1.3;">
            &#x26A0;&#xFE0F;
          </td>
          <td style="font-family:${F};font-size:13px;font-weight:400;
                     color:#6a5000;line-height:1.7;">
            For security, you'll be asked to choose a new password on your
            <strong style="font-weight:600;">first sign-in</strong>.
            Keep this email safe until then.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- CTA Button -->
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="min-width:100%">
  <tr>
    <th valign="top" align="center" style="text-align:center;font-weight:normal;line-height:100%">
      <!--[if mso]>
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" width="74%"
             style="border-collapse:separate;border-spacing:0;margin-right:auto;margin-left:auto">
        <tr>
          <td valign="middle" align="center"
              style="width:74%;border-radius:43px;background-color:#ec7147;text-align:center;
                     color:#fff;padding:15px 18px;mso-padding-left-alt:0;margin-left:18px"
              bgcolor="#ec7147">
            <a style="display:inline-block;text-decoration:none;font-family:${F};
                      font-weight:700;font-size:15px;line-height:150%;letter-spacing:-0.1px;
                      text-align:center;color:#fff"
               href="${SITE}/login" target="_blank">
              Sign in to Playbook of Burma
            </a>
          </td>
        </tr>
      </table>
      <![endif]-->
      <!--[if !mso]><!-- -->
      <a style="display:inline-block;box-sizing:border-box;border-radius:43px;
                background-color:#ec7147;padding:15px 18px;width:74%;
                font-family:${F};font-weight:700;font-size:15px;line-height:150%;
                letter-spacing:-0.1px;color:#ffffff;vertical-align:top;text-align:center;
                text-align-last:center;text-decoration:none;-webkit-text-size-adjust:none"
         href="${SITE}/login" target="_blank">
        Sign in to Playbook of Burma
      </a>
      <!--<![endif]-->
    </th>
  </tr>
</table>`;

  const text = [
    `Hi ${name},`,
    "",
    "Your membership has been approved.",
    "You now have full access to Playbook of Burma.",
    "",
    `Email:              ${to}`,
    `Temporary Password: ${tempPassword}`,
    "",
    "You'll be asked to choose a new password on your first sign-in.",
    "Keep this email safe until then.",
    "",
    `Sign in at: ${SITE}/login`,
    "",
    `© ${new Date().getFullYear()} Playbook of Burma`,
  ].join("\n");

  await send(to, subject, shell(body), text);
}
