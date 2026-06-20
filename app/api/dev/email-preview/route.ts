import { NextRequest, NextResponse } from "next/server";
import { shell } from "@/lib/server/email/shell";
import { SITE } from "@/lib/server/email/client";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  const t    = req.nextUrl.searchParams.get("t") ?? "welcome";
  const name = "Thura Nyi";
  const to   = "thuranyi64@gmail.com";
  let body   = "";

  if (t === "welcome") {
    const pass = "acWf*pHMT8";
    const F = "'Poppins',Arial,Helvetica,sans-serif";
    body = `
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 20px;">
      <div style="font-family:${F};font-size:15px;font-weight:600;color:#151515;line-height:150%;letter-spacing:-0.1px;">
        Hi ${name},
      </div>
    </td>
  </tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 8px;">
      <div style="font-family:${F};font-size:15px;font-weight:400;color:#444;line-height:170%;letter-spacing:-0.1px;">
        Your membership has been approved. You now have full access to
        <strong style="color:#151515;font-weight:600;">Playbook of Burma</strong> —
        Myanmar's platform for learning from the country's top founders, CEOs, and business leaders.
      </div>
    </td>
  </tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 28px;">
      <div style="font-family:${F};font-size:15px;font-weight:400;color:#444;line-height:170%;letter-spacing:-0.1px;">
        Use the credentials below to sign in and get started.
      </div>
    </td>
  </tr>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
       style="background:#f8f8f8;border-radius:8px;border:1px solid #e4e4e4;overflow:hidden;margin-bottom:12px;">
  <tr>
    <td style="padding:14px 20px;border-bottom:1px solid #e4e4e4;">
      <div style="font-family:${F};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin-bottom:5px;">Email Address</div>
      <div style="font-family:${F};font-size:15px;font-weight:500;color:#151515;">
        <span style="color:#151515!important;text-decoration:none!important;">${to}</span>
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px 20px 18px;">
      <div style="font-family:${F};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin-bottom:12px;">Temporary Password</div>
      <div style="text-align:center;">
        <span style="font-family:'Courier New',Courier,monospace;font-size:26px;font-weight:700;letter-spacing:6px;color:#151515;line-height:1;">${pass}</span>
      </div>
    </td>
  </tr>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
       style="background:#fffdf0;border:1px solid #f0e08a;border-radius:6px;margin-bottom:32px;">
  <tr>
    <td style="padding:12px 16px;">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="vertical-align:top;padding-right:9px;font-size:14px;line-height:1.3;">&#x26A0;&#xFE0F;</td>
          <td style="font-family:${F};font-size:13px;font-weight:400;color:#6a5000;line-height:1.7;">
            For security, you'll be asked to choose a new password on your
            <strong style="font-weight:600;">first sign-in</strong>.
            Keep this email safe until then.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="min-width:100%">
  <tr>
    <th valign="top" align="center" style="text-align:center;font-weight:normal;line-height:100%">
      <a style="display:inline-block;box-sizing:border-box;border-radius:43px;background-color:#ec7147;
                padding:15px 18px;width:74%;font-family:${F};font-weight:700;font-size:15px;
                line-height:150%;letter-spacing:-0.1px;color:#ffffff;vertical-align:top;text-align:center;
                text-align-last:center;text-decoration:none;-webkit-text-size-adjust:none"
         href="${SITE}/login" target="_blank">
        Sign in to Playbook of Burma
      </a>
    </th>
  </tr>
</table>`;

  } else if (t === "reset") {
    const F2        = "'Poppins',Arial,Helvetica,sans-serif";
    const code      = "847291";
    const expiryStr = "08:30 PM";
    body = `
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 20px;">
      <div style="font-family:${F2};font-size:15px;font-weight:600;color:#151515;line-height:150%;letter-spacing:-0.1px;">
        Hi there,
      </div>
    </td>
  </tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 28px;">
      <div style="font-family:${F2};font-size:15px;font-weight:400;color:#444;line-height:170%;letter-spacing:-0.1px;">
        We received a request to reset the password for your Playbook of Burma account.
        Use the code below to continue — it expires at
        <strong style="color:#151515;font-weight:600;">${expiryStr} MMT</strong>.
        If you didn't request this, you can safely ignore this email.
      </div>
    </td>
  </tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 10px;">
      <div style="font-family:${F2};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;">
        Your Reset Code
      </div>
    </td>
  </tr>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;">
  <tr>
    <td style="padding:28px 20px;background:#f8f8f8;border:1.5px solid #e4e4e4;border-radius:8px;text-align:center;">
      <span style="font-family:'Courier New',Courier,monospace;font-size:44px;font-weight:800;letter-spacing:16px;color:#151515;line-height:1;display:block;">${code}</span>
    </td>
  </tr>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
  <tr>
    <td style="padding:13px 20px;background:#f8f8f8;border:1px solid #e4e4e4;border-radius:6px;text-align:center;font-family:${F2};font-size:13px;font-weight:400;color:#888;line-height:1.75;">
      This code is valid for a single use only.
      Never share it with anyone.
    </td>
  </tr>
</table>`;

  } else if (t === "achievement") {
    const F3    = "'Poppins',Arial,Helvetica,sans-serif";
    const title = "The Art of Building a Myanmar Startup";
    body = `
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 20px;">
      <div style="font-family:${F3};font-size:15px;font-weight:600;color:#151515;line-height:150%;letter-spacing:-0.1px;">
        Hi ${name},
      </div>
    </td>
  </tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 8px;">
      <div style="font-family:${F3};font-size:15px;font-weight:400;color:#444;line-height:170%;letter-spacing:-0.1px;">
        <strong style="font-weight:700;color:#151515;">Congratulations!</strong>
        You've just finished a full playbook — that's a real achievement. We're proud of your commitment.
      </div>
    </td>
  </tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  <tr>
    <td style="padding:0 0 28px;">
      <div style="font-family:${F3};font-size:15px;font-weight:400;color:#444;line-height:170%;letter-spacing:-0.1px;">
        There are more playbooks waiting for you, with insights from Myanmar's best founders and entrepreneurs.
      </div>
    </td>
  </tr>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
       style="background:#f8f8f8;border-radius:8px;border:1px solid #e4e4e4;border-left:4px solid #ec7147;overflow:hidden;margin-bottom:32px;">
  <tr>
    <td style="padding:16px 20px;">
      <div style="font-family:${F3};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin-bottom:7px;">Completed Playbook</div>
      <div style="font-family:${F3};font-size:17px;font-weight:700;color:#151515;line-height:1.4;letter-spacing:-0.2px;">${title}</div>
    </td>
  </tr>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="min-width:100%">
  <tr>
    <th valign="top" align="center" style="text-align:center;font-weight:normal;line-height:100%">
      <a style="display:inline-block;box-sizing:border-box;border-radius:43px;background-color:#ec7147;
                padding:15px 18px;width:74%;font-family:${F3};font-weight:700;font-size:15px;
                line-height:150%;letter-spacing:-0.1px;color:#ffffff;vertical-align:top;text-align:center;
                text-align-last:center;text-decoration:none;-webkit-text-size-adjust:none"
         href="${SITE}/user-portal" target="_blank">
        Explore More Playbooks
      </a>
    </th>
  </tr>
</table>`;
  }

  if (!body) {
    return new NextResponse("Use ?t=welcome | reset | achievement", { status: 400 });
  }

  return new NextResponse(shell(body), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
