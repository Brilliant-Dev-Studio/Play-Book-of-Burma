import { send, SITE } from "./client";
import { shell } from "./shell";

const F = "'Poppins',Arial,Helvetica,sans-serif";

export async function sendPlaybookAchievedEmail(
  to: string,
  playbookTitle: string,
  displayName?: string | null,
): Promise<void> {
  const name    = displayName ?? "there";
  const subject = `You've completed "${playbookTitle}" 🎉`;

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
        <strong style="font-weight:700;color:#151515;">Congratulations!</strong>
        You've just finished a full playbook — that's a real achievement. We're proud of your commitment.
      </div>
    </td>
  </tr>
</table>

<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 28px;">
      <div style="font-family:${F};font-size:15px;font-weight:400;
                  color:#444;line-height:170%;letter-spacing:-0.1px;">
        There are more playbooks waiting for you, with insights from Myanmar's best
        founders and entrepreneurs.
      </div>
    </td>
  </tr>
</table>

<!-- Playbook title card -->
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
       style="background:#f8f8f8;border-radius:8px;border:1px solid #e4e4e4;
              border-left:4px solid #ec7147;overflow:hidden;margin-bottom:32px;">
  <tr>
    <td style="padding:16px 20px;">
      <div style="font-family:${F};font-size:11px;font-weight:600;
                  letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin-bottom:7px;">
        Completed Playbook
      </div>
      <div style="font-family:${F};font-size:17px;font-weight:700;
                  color:#151515;line-height:1.4;letter-spacing:-0.2px;">
        ${playbookTitle}
      </div>
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
               href="${SITE}/user-portal" target="_blank">
              Explore More Playbooks
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
         href="${SITE}/user-portal" target="_blank">
        Explore More Playbooks
      </a>
      <!--<![endif]-->
    </th>
  </tr>
</table>`;

  const text = [
    `Hi ${name},`,
    "",
    `Congratulations! You've completed: ${playbookTitle}`,
    "",
    "That's a real achievement. There are more playbooks waiting for you.",
    "",
    `Explore more: ${SITE}/user-portal`,
    "",
    `© ${new Date().getFullYear()} Playbook of Burma`,
  ].join("\n");

  await send(to, subject, shell(body), text);
}
