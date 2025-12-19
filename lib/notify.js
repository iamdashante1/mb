const DEFAULT_RECIPIENTS = ["akaylah.bailey@gmail.com"];

function getRecipients() {
  const envList = (process.env.NOTIFY_EMAILS || "").split(",").map((item) => item.trim()).filter(Boolean);
  const recipients = Array.from(new Set([...DEFAULT_RECIPIENTS, ...envList]));
  return recipients;
}

async function getTransporter() {
  const host =
    process.env.MAILTRAP_HOST ||
    process.env.EMAIL_HOST ||
    process.env.SMTP_HOST ||
    "live.smtp.mailtrap.io";
  const user =
    process.env.MAILTRAP_USER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    (process.env.MAILTRAP_TOKEN ? "api" : undefined);
  const pass =
    process.env.MAILTRAP_TOKEN ||
    process.env.EMAIL_PASSWORD ||
    process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
  const secure = process.env.EMAIL_SECURE === "true" || process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass || !from) {
    throw new Error(
      "SMTP settings are missing. Set MAILTRAP_* or EMAIL_* (or SMTP_*) variables."
    );
  }

  const nodemailer = await import("nodemailer");
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function formatTextPreview(data) {
  return Object.entries(data)
    .map(([key, value]) => `${key}: ${value || "-"}`)
    .join("\n");
}

export async function sendNotification({ subject, data }) {
  try {
    const recipients = getRecipients();
    if (!recipients.length) {
      console.warn("Notification skipped: no recipients configured.");
      return;
    }

    const transporter = await getTransporter();
    const from = process.env.SMTP_FROM;
    const text = formatTextPreview(data);

    await transporter.sendMail({
      from,
      to: recipients.join(","),
      subject,
      text,
    });
  } catch (error) {
    console.error("Unable to send notification email", error);
  }
}
