import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
}

export async function sendEmail(options: EmailOptions) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }

  const msg = {
    to: options.to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: process.env.SENDGRID_FROM_NAME || "Hous of The Darling Starling",
    },
    subject: options.subject,
    html: options.html,
    ...(options.cc?.length && { cc: options.cc }),
    ...(options.bcc?.length && { bcc: options.bcc }),
  };

  console.log("[Email] Sending from:", process.env.SENDGRID_FROM_EMAIL, "to:", options.to);
  await sgMail.send(msg);
}
