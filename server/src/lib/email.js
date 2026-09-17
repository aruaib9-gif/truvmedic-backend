import { Resend } from "resend";
import { env, isConfigured } from "./env.js";

const resend = isConfigured.resend ? new Resend(env.resend.apiKey) : null;

/**
 * Sends an email through Resend. When no API key is configured the message is
 * logged instead of sent, so local development and first deploys never crash.
 */
export async function sendEmail({ to, subject, body, from_name, reply_to }) {
  if (!to || !subject) {
    throw new Error("sendEmail requires `to` and `subject`");
  }

  const isHtml = typeof body === "string" && body.trim().startsWith("<");
  const from = from_name ? `${from_name} <${addressOf(env.resend.from)}>` : env.resend.from;

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — would have sent "${subject}" to ${to}`);
    return { id: null, skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    ...(isHtml ? { html: body } : { text: body || "" }),
    ...(reply_to ? { replyTo: reply_to } : {}),
  });

  if (error) throw new Error(error.message || "Email delivery failed");
  return { id: data?.id ?? null, skipped: false };
}

/** Pulls the bare address out of a "Name <addr@host>" string. */
function addressOf(value) {
  const match = /<([^>]+)>/.exec(value || "");
  return match ? match[1] : value;
}
