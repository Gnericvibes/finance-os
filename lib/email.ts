import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

// Create a singleton instance if API key exists
let resend: Resend | null = null;

export function getResend(): Resend {
  if (!resend) {
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resend = new Resend(resendApiKey);
  }
  return resend;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();

  const { error } = await resend.emails.send({
    from: `PFOS <noreply@${process.env.RESEND_DOMAIN || "finance-os.app"}>`,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
