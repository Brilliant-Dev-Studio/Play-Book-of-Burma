import { LOGO, SITE } from "./client";

const BADGES = "https://amara-nadi.s3.ap-southeast-1.amazonaws.com/Untitled+design(40).png";

export function shell(body: string): string {
  const yr = new Date().getFullYear();
  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8"/>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<!--[if !mso]><!-- --><meta http-equiv="X-UA-Compatible" content="IE=edge"/><!--<![endif]-->
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no"/>
<meta name="x-apple-disable-message-reformatting"/>
<link href="https://fonts.googleapis.com/css?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900" rel="stylesheet"/>
<title>Playbook of Burma</title>
<!--[if !mso]><!-- -->
<style>
@font-face{font-family:'Poppins';font-style:normal;font-weight:400;src:url('https://fonts.gstatic.com/l/font?kit=pxiEyp8kv8JHgFVrJJnedA&skey=87759fb096548f6d&v=v24') format('woff'),url('https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrJJnecg.woff2') format('woff2');}
@font-face{font-family:'Poppins';font-style:normal;font-weight:500;src:url('https://fonts.gstatic.com/l/font?kit=pxiByp8kv8JHgFVrLGT9Z1JlEw&skey=d4526a9b64c21b87&v=v24') format('woff'),url('https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLGT9Z1JlFQ.woff2') format('woff2');}
@font-face{font-family:'Poppins';font-style:normal;font-weight:600;src:url('https://fonts.gstatic.com/l/font?kit=pxiByp8kv8JHgFVrLEj6Z1JlEw&skey=ce7ef9d62ca89319&v=v24') format('woff'),url('https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLEj6Z1JlFQ.woff2') format('woff2');}
@font-face{font-family:'Poppins';font-style:normal;font-weight:700;src:url('https://fonts.gstatic.com/l/font?kit=pxiByp8kv8JHgFVrLCz7Z1JlEw&skey=cea76fe63715a67a&v=v24') format('woff'),url('https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLCz7Z1JlFQ.woff2') format('woff2');}
@font-face{font-family:'Poppins';font-style:normal;font-weight:800;src:url('https://fonts.gstatic.com/l/font?kit=pxiByp8kv8JHgFVrLDD4Z1JlEw&skey=f01e006f58df81ac&v=v24') format('woff'),url('https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLDD4Z1JlFQ.woff2') format('woff2');}
</style>
<!--<![endif]-->
<style>
html,body{margin:0!important;padding:0!important;min-height:100%!important;width:100%!important;-webkit-font-smoothing:antialiased;}
*{-ms-text-size-adjust:100%;}
#outlook a{padding:0;}
.ReadMsgBody,.ExternalClass{width:100%;}
.ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{line-height:100%;}
table,td,th{mso-table-lspace:0!important;mso-table-rspace:0!important;border-collapse:collapse;}
u + .body table,u + .body td,u + .body th{will-change:transform;}
body,td,th,p,div,li,a,span{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;mso-line-height-rule:exactly;}
img{border:0;outline:0;line-height:100%;text-decoration:none;-ms-interpolation-mode:bicubic;}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}
.body .pc-project-body{background-color:transparent!important;}
@media (min-width:621px){.pc-lg-hide{display:none;}.pc-lg-bg-img-hide{background-image:none!important;}}
</style>
<style>
@media (max-width:620px){
  .pc-project-body{min-width:0!important;}
  .pc-project-container,.pc-component{width:100%!important;}
  .pc-sm-bg-img-hide{background-image:none!important;}
  .pc-g-rb{display:block!important;width:auto!important;}
  .pc-g-wf{width:100%!important;}
  .pc-w620-padding-30-30-30-30{padding:30px!important;}
  .pc-w620-padding-35-35-55-35{padding:35px 35px 55px!important;}
  .pc-w620-padding-10-30-10-30{padding:10px 30px!important;}
  .pc-w620-padding-25-30-25-30{padding:25px 30px!important;}
  .pc-w620-itemsVSpacings-20{padding-top:10px!important;padding-bottom:10px!important;}
  .pc-g-ib{display:inline-block!important;}
  .pc-g-b{display:block!important;}
  .pc-g-rpt{padding-top:0!important;}
  .pc-g-rpr{padding-right:0!important;}
  .pc-g-rpb{padding-bottom:0!important;}
  .pc-g-rpl{padding-left:0!important;}
  .pc-sm-hide{display:none!important;}
}
@media (max-width:520px){
  .pc-w520-padding-25-25-25-25{padding:25px!important;}
  .pc-w520-padding-30-30-50-30{padding:30px 30px 50px!important;}
  .pc-w520-padding-10-25-10-25{padding:10px 25px!important;}
  .pc-w520-padding-30-30-30-30{padding:30px!important;}
}
</style>
<!--[if mso]><style type="text/css">.pc-font-alt{font-family:Arial,Helvetica,sans-serif!important;}</style><![endif]-->
<!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body class="body pc-font-alt" bgcolor="#f4f4f4"
      style="width:100%!important;min-height:100%!important;margin:0!important;padding:0!important;
             mso-line-height-rule:exactly;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;
             -ms-text-size-adjust:100%;font-variant-ligatures:normal;text-rendering:optimizeLegibility;
             -moz-osx-font-smoothing:grayscale;background-color:#f4f4f4;font-feature-settings:'calt'">

<table class="pc-project-body" bgcolor="#f4f4f4"
       style="table-layout:fixed;width:100%;min-width:600px;background-color:#f4f4f4"
       border="0" cellspacing="0" cellpadding="0" role="presentation">
<tr><td align="center" valign="top" style="width:auto">
<table class="pc-project-container" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td style="padding:20px 0" align="left" valign="top">

  <!-- ░░ TOP BAR ░░ -->
  <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center"
         border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td valign="top" class="pc-w520-padding-25-25-25-25 pc-w620-padding-30-30-30-30"
          style="padding:28px 30px;height:unset;background-color:#1a1210;"
          bgcolor="#1a1210">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" valign="top" style="padding:0 0 14px;height:auto">
              <img src="${LOGO}" width="50" height="50" alt="Playbook of Burma"
                   style="display:block;outline:0;line-height:100%;-ms-interpolation-mode:bicubic;
                          width:50px;height:50px;max-width:100%;border-radius:10px;border:0"/>
            </td>
          </tr>
          <tr>
            <td align="center">
              <div class="pc-font-alt"
                   style="line-height:171%;letter-spacing:-0.2px;font-family:'Poppins',Arial,Helvetica,sans-serif;
                          font-size:13px;font-weight:700;color:#ffffff;text-align:center;text-align-last:center">
                Playbook of Burma
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- ░░ MAIN CONTENT ░░ -->
  <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center"
         border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td valign="top" class="pc-w520-padding-30-30-50-30 pc-w620-padding-35-35-55-35"
          style="padding:40px 40px 56px;height:unset;background-color:#ffffff" bgcolor="#ffffff">
        ${body}
      </td>
    </tr>
  </table>

  <!-- ░░ DIVIDER ░░ -->
  <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center"
         border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td valign="top" class="pc-w520-padding-10-25-10-25 pc-w620-padding-10-30-10-30"
          style="padding:0 40px;height:unset;background-color:#ffffff" bgcolor="#ffffff">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td valign="top" style="line-height:1px;font-size:1px;border-bottom:1px solid #D9D9D9">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- ░░ APP BADGES ░░ -->
  <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center"
         border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td valign="top" class="pc-w520-padding-25-25-25-25 pc-w620-padding-35-35-35-35"
          style="padding:32px 40px;height:unset;background-color:#ffffff" bgcolor="#ffffff">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <!-- LEFT: text -->
            <td valign="middle" style="width:55%;padding-right:24px;">
              <div style="font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;
                          color:#151515;letter-spacing:-0.3px;line-height:1.3;margin-bottom:10px;">
                Download<br/>
                <span style="color:#ec7147;">Playbook of Burma</span>
              </div>
              <div style="font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:13px;font-weight:400;
                          color:#9b9b9b;line-height:1.65;">
                Learn from Myanmar's top founders and CEOs — anytime, anywhere.
              </div>
            </td>
            <!-- RIGHT: badges -->
            <td valign="middle" align="right" style="width:45%;">
              <img src="${BADGES}" width="190" alt="Available on App Store and Google Play"
                   style="display:block;border:0;outline:0;line-height:100%;-ms-interpolation-mode:bicubic;
                          width:190px;height:auto;max-width:100%;margin-left:auto;"/>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- ░░ BOTTOM BAR ░░ -->
  <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center"
         border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td valign="top" class="pc-w520-padding-25-25-25-25 pc-w620-padding-30-30-30-30"
          style="padding:28px 30px;height:unset;background-color:#1a1210;"
          bgcolor="#1a1210">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" valign="top" style="padding:0 0 14px;height:auto">
              <img src="${LOGO}" width="36" height="36" alt=""
                   style="display:block;outline:0;line-height:100%;-ms-interpolation-mode:bicubic;
                          width:36px;height:36px;max-width:100%;border-radius:8px;border:0;margin:0 auto;"/>
            </td>
          </tr>
          <tr>
            <td align="center">
              <div class="pc-font-alt"
                   style="line-height:171%;letter-spacing:-0.2px;font-family:'Poppins',Arial,Helvetica,sans-serif;
                          font-size:12px;font-weight:normal;color:#7a6a5e;text-align:center;text-align-last:center">
                © ${yr} Playbook of Burma &nbsp;·&nbsp; Myanmar's business learning platform.<br/>
                <a href="${SITE}" target="_blank"
                   style="text-decoration:none;color:#ec7147;font-weight:500;">
                  Visit playbookofburma.com
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
