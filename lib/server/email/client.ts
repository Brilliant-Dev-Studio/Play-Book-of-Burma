import "server-only";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export const FROM = process.env.SES_FROM_ADDRESS ?? "noreply@playbookofburma.com";
export const LOGO = "https://amara-nadi.s3.ap-southeast-1.amazonaws.com/logo-1.png";
export const SITE = "https://playbookofburma.com";

const ses = new SESv2Client({
  region: process.env.AWS_REGION ?? "ap-southeast-1",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function send(to: string, subject: string, html: string, text: string) {
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: `Playbook of Burma <${FROM}>`,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: html, Charset: "UTF-8" },
            Text: { Data: text,  Charset: "UTF-8" },
          },
        },
      },
    }),
  );
}
