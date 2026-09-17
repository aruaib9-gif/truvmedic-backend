/**
 * Transactional email templates.
 * Ported from the former Base44 edge functions; markup is unchanged so the
 * emails candidates receive look exactly as they did before.
 */
import { env } from "./env.js";

const LOGO_URL = process.env.LOGO_URL || `${env.appUrl.replace(/\/$/, "")}/logo.png`;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "info@truvmedic.com";
const SUPPORT_PHONE = process.env.SUPPORT_PHONE || "+234 800 000 0000";

/** Escapes user-supplied values before they are interpolated into HTML. */
export function esc(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const header = (subtitle = "Medical Staffing &amp; Occupational Health") => `
  <tr>
    <td style="background:linear-gradient(135deg,#0A3272 0%,#1565C0 100%);padding:28px 32px;text-align:center;">
      <img src="${LOGO_URL}" alt="TRUV Medical Services" width="160" height="auto"
           style="display:block;margin:0 auto;max-width:160px;height:auto;object-fit:contain;" />
      <p style="color:rgba(255,255,255,0.75);font-size:12px;margin:10px 0 0;letter-spacing:1px;text-transform:uppercase;">
        ${subtitle}
      </p>
    </td>
  </tr>`;

const footerBar = `
  <tr>
    <td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
      <p style="font-size:11px;color:#9ca3af;margin:0;">
        This is an official communication from TRUV Medical Services Limited.<br/>
        24/7 Emergency: <a href="tel:${SUPPORT_PHONE.replace(/\s/g, "")}" style="color:#0A3272;text-decoration:none;">${SUPPORT_PHONE}</a>
        &nbsp;|&nbsp;
        <a href="mailto:${SUPPORT_EMAIL}" style="color:#0A3272;text-decoration:none;">${SUPPORT_EMAIL}</a>
      </p>
    </td>
  </tr>`;

const shell = (inner) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TRUV Medical</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        ${inner}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export function candidateMessageEmail({ candidateName, jobTitle, messageBody, footerNote }) {
  return shell(`
    ${header()}
    <tr>
      <td style="padding:36px 32px 24px;">
        <p style="font-size:16px;color:#1a2a3a;margin:0 0 16px;">Dear <strong>${esc(candidateName)}</strong>,</p>
        <div style="font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap;">${esc(messageBody)}</div>
      </td>
    </tr>
    <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" /></td></tr>
    <tr>
      <td style="padding:20px 32px 28px;">
        <p style="font-size:13px;color:#6b7280;margin:0 0 4px;">Regarding your application for:</p>
        <p style="font-size:14px;font-weight:600;color:#0A3272;margin:0 0 16px;">${esc(jobTitle)}</p>
        ${footerNote ? `<p style="font-size:12px;color:#9ca3af;margin:0 0 12px;">${footerNote}</p>` : ""}
        <p style="font-size:13px;color:#374151;margin:0;">Best regards,<br/>
        <strong style="color:#0A3272;">TRUV Medical Services Limited</strong><br/>
        <span style="color:#6b7280;">Recruitment Team</span></p>
      </td>
    </tr>
    ${footerBar}`);
}

export function interviewInviteEmail({
  applicantName, jobTitle, interviewDate, interviewTime, interviewType,
  meetLink, location, interviewers, additionalNotes,
}) {
  const locationRow = meetLink
    ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">📹 Meeting Link</td><td style="padding:6px 0;font-size:14px;color:#0A3272;"><a href="${esc(meetLink)}" style="color:#0A3272;">${esc(meetLink)}</a></td></tr>`
    : location
      ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">📍 Location</td><td style="padding:6px 0;font-size:14px;color:#1a2a3a;">${esc(location)}</td></tr>`
      : "";

  const interviewerDisplay = Array.isArray(interviewers) && interviewers.length > 0
    ? esc(interviewers.map((i) => i.name || i.email).filter(Boolean).join(", "))
    : "TRUV Medical Recruitment Team";

  const notesBlock = additionalNotes
    ? `<tr><td style="padding:24px 32px 0;">
         <div style="background:#fff8e1;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:6px;">
           <p style="font-size:13px;font-weight:600;color:#92400e;margin:0 0 4px;">Additional Notes</p>
           <p style="font-size:13px;color:#78350f;margin:0;">${esc(additionalNotes)}</p>
         </div></td></tr>`
    : "";

  return shell(`
    ${header()}
    <tr>
      <td style="background:#e8f5e9;padding:18px 32px;border-bottom:1px solid #c8e6c9;">
        <p style="font-size:15px;color:#2e7d32;margin:0;font-weight:600;">
          🎉 Congratulations, ${esc(applicantName)}! You've progressed to the interview stage.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px 20px;">
        <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.6;">
          We are pleased to invite you for an interview for the position of
          <strong style="color:#0A3272;">${esc(jobTitle)}</strong> at TRUV Medical Services Limited.
        </p>
        <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
          <p style="font-size:13px;font-weight:700;color:#0A3272;margin:0 0 14px;letter-spacing:0.5px;text-transform:uppercase;">Interview Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;width:40%;">🗓 Date</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a2a3a;">${esc(interviewDate)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">⏰ Time</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a2a3a;">${esc(interviewTime)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">🎯 Format</td><td style="padding:6px 0;font-size:14px;color:#1a2a3a;">${esc(interviewType) || "Virtual / Online"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">👤 Interviewer(s)</td><td style="padding:6px 0;font-size:14px;color:#1a2a3a;">${interviewerDisplay}</td></tr>
            ${locationRow}
          </table>
        </div>
        <div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;padding:18px 24px;">
          <p style="font-size:13px;font-weight:700;color:#374151;margin:0 0 12px;letter-spacing:0.5px;text-transform:uppercase;">Preparation Tips</p>
          <ul style="margin:0;padding-left:18px;color:#6b7280;font-size:14px;line-height:1.9;">
            <li>Be available <strong>5 minutes</strong> before the scheduled time.</li>
            <li>Have a copy of your <strong>CV and certifications</strong> ready.</li>
            <li>Ensure a <strong>stable internet connection</strong> (for virtual interviews).</li>
            <li>Be prepared to discuss your experience and suitability for the role.</li>
          </ul>
        </div>
      </td>
    </tr>
    ${notesBlock}
    <tr>
      <td style="padding:20px 32px 28px;">
        <p style="font-size:13px;color:#6b7280;margin:0 0 12px;">
          If you need to reschedule or have any questions, please contact our recruitment team immediately.
        </p>
        <p style="font-size:13px;color:#374151;margin:0;">Best regards,<br/>
        <strong style="color:#0A3272;">TRUV Medical Services Limited</strong><br/>
        <span style="color:#6b7280;">Recruitment Team</span></p>
      </td>
    </tr>
    ${footerBar}`);
}

export function interviewerBriefEmail({
  interviewerName, applicantName, jobTitle, interviewDate,
  interviewTime, interviewType, meetLink, location, additionalNotes,
}) {
  const locationRow = meetLink
    ? `<tr><td style="color:#6b7280;font-size:14px;padding:5px 0;width:40%;">📹 Meeting Link</td><td style="font-size:14px;color:#0A3272;padding:5px 0;"><a href="${esc(meetLink)}">${esc(meetLink)}</a></td></tr>`
    : location
      ? `<tr><td style="color:#6b7280;font-size:14px;padding:5px 0;">📍 Location</td><td style="font-size:14px;padding:5px 0;">${esc(location)}</td></tr>`
      : "";

  return shell(`
    ${header("Interview Assignment")}
    <tr><td style="padding:28px 32px;">
      <p style="font-size:15px;color:#374151;margin:0 0 18px;">Dear <strong>${esc(interviewerName) || "Interviewer"}</strong>,</p>
      <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.6;">You have been assigned to conduct an interview for the following candidate at TRUV Medical Services Limited.</p>
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:10px;padding:18px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="color:#6b7280;font-size:14px;padding:5px 0;width:40%;">👤 Candidate</td><td style="font-size:14px;font-weight:600;padding:5px 0;">${esc(applicantName)}</td></tr>
          <tr><td style="color:#6b7280;font-size:14px;padding:5px 0;">💼 Role</td><td style="font-size:14px;padding:5px 0;">${esc(jobTitle)}</td></tr>
          <tr><td style="color:#6b7280;font-size:14px;padding:5px 0;">🗓 Date</td><td style="font-size:14px;font-weight:600;padding:5px 0;">${esc(interviewDate)}</td></tr>
          <tr><td style="color:#6b7280;font-size:14px;padding:5px 0;">⏰ Time</td><td style="font-size:14px;font-weight:600;padding:5px 0;">${esc(interviewTime)}</td></tr>
          <tr><td style="color:#6b7280;font-size:14px;padding:5px 0;">🎯 Format</td><td style="font-size:14px;padding:5px 0;">${esc(interviewType) || "Virtual"}</td></tr>
          ${locationRow}
        </table>
      </div>
      ${additionalNotes ? `<div style="background:#fff8e1;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:6px;margin-top:16px;"><p style="font-size:13px;color:#92400e;margin:0;"><strong>Notes:</strong> ${esc(additionalNotes)}</p></div>` : ""}
      <p style="font-size:13px;color:#6b7280;margin:20px 0 0;">Please confirm your availability with the recruitment team.</p>
      <p style="font-size:13px;color:#374151;margin:12px 0 0;">Best regards,<br/><strong style="color:#0A3272;">TRUV Medical Services Limited</strong></p>
    </td></tr>
    ${footerBar}`);
}

export function newApplicationEmail({
  applicantName, applicantEmail, jobTitle, phone, yearsExperience, certifications,
}) {
  const certs = Array.isArray(certifications) && certifications.length > 0
    ? certifications.join(", ")
    : "None listed";

  return `New Job Application Received — TRUV Medical Services

Position: ${jobTitle}
Applicant: ${applicantName}
Email: ${applicantEmail}
Phone: ${phone || "Not provided"}
Years of Experience: ${yearsExperience || "Not specified"}
Certifications Uploaded: ${certs}

Please log in to the admin portal to review this application and any uploaded documents.`;
}
