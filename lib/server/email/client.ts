import "server-only";
import { Resend } from "resend";

export const FROM = process.env.RESEND_FROM_ADDRESS ?? "noreply@playbookofburma.com";
export const LOGO = "https://amara-nadi.s3.ap-southeast-1.amazonaws.com/logo-1.png";
export const SITE = "https://playbookofburma.com";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function send(to: string, subject: string, html: string, text: string) {
  const { error } = await resend.emails.send({
    from: `Playbook of Burma <${FROM}>`,
    to: [to],
    subject,
    html,
    text,
  });
  if (error) throw new Error(error.message);
}
