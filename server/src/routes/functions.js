/**
 * Named server actions — the replacement for Base44 edge functions.
 * Route names match the old `base44.functions.invoke("<name>", ...)` calls.
 */
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import { sendEmail } from "../lib/email.js";
import { broadcast } from "../lib/realtime.js";
import { asyncHandler, badRequest } from "../lib/errors.js";
import { requireLevel } from "../middleware/auth.js";
import {
  candidateMessageEmail,
  interviewInviteEmail,
  interviewerBriefEmail,
  newApplicationEmail,
} from "../lib/templates.js";

const router = Router();

const publicLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 20, legacyHeaders: false });

/**
 * Notifies the recruitment inbox that a new application arrived.
 * Public: it fires immediately after an applicant submits the careers form.
 */
router.post(
  "/notifyNewApplication",
  publicLimiter,
  asyncHandler(async (req, res) => {
    const {
      applicant_name, applicant_email, job_title, phone,
      years_experience, certifications,
    } = req.body || {};

    if (!applicant_name || !applicant_email || !job_title) {
      throw badRequest("applicant_name, applicant_email and job_title are required");
    }

    // The notification address is server-controlled — a client must not be able
    // to redirect internal application details to an arbitrary inbox.
    await sendEmail({
      to: env.resend.notifyEmail,
      subject: `New Application: ${job_title} — ${applicant_name}`,
      body: newApplicationEmail({
        applicantName: applicant_name,
        applicantEmail: applicant_email,
        jobTitle: job_title,
        phone,
        yearsExperience: years_experience,
        certifications,
      }),
      reply_to: applicant_email,
    });

    res.json({ success: true });
  })
);

/** Emails a candidate and logs the message against their application. */
router.post(
  "/sendCandidateMessage",
  requireLevel("staff"),
  asyncHandler(async (req, res) => {
    const {
      application_id, candidate_email, candidate_name, job_title,
      subject, message_body, message_type = "general", admin_email,
    } = req.body || {};

    if (!application_id || !candidate_email || !message_body) {
      throw badRequest("application_id, candidate_email and message_body are required");
    }

    const application = await prisma.jobApplication.findUnique({ where: { id: application_id } });
    if (!application) throw badRequest("Unknown application");

    const emailSubject = subject || `Update on your application — ${job_title || "TRUV Medical"}`;

    await sendEmail({
      to: candidate_email,
      from_name: "TRUV Medical Recruitment",
      subject: emailSubject,
      body: candidateMessageEmail({
        candidateName: candidate_name || "Candidate",
        jobTitle: job_title || "a position at TRUV Medical",
        messageBody: message_body,
      }),
    });

    if (admin_email) {
      await sendEmail({
        to: admin_email,
        from_name: "TRUV Medical Recruitment (Admin Copy)",
        subject: `[COPY] ${emailSubject}`,
        body: candidateMessageEmail({
          candidateName: candidate_name || "Candidate",
          jobTitle: job_title || "a position at TRUV Medical",
          messageBody: message_body,
          footerNote: `<em>Admin copy — sent to ${candidate_name} &lt;${candidate_email}&gt;</em>`,
        }),
      });
    }

    const logged = await prisma.candidateMessage.create({
      data: {
        application_id,
        candidate_email,
        candidate_name: candidate_name || "",
        job_title: job_title || "",
        direction: "outbound",
        subject: emailSubject,
        body: message_body,
        sent_by: req.user.email,
        email_sent: true,
        message_type,
        created_by: req.user.email,
      },
    });

    broadcast("CandidateMessage", { action: "create", id: logged.id });
    res.json({ success: true });
  })
);

/**
 * Sends the interview invitation to the candidate, copies the admin and each
 * interviewer, moves the application to "interview" and logs the event.
 * Individual email failures are collected as warnings rather than failing the
 * whole request — the status change and audit log still matter.
 */
router.post(
  "/sendInterviewInvite",
  requireLevel("staff"),
  asyncHandler(async (req, res) => {
    const {
      applicant_name, applicant_email, job_title, interview_date, interview_time,
      interview_type, meet_link, location, interviewers, interviewer_name,
      interviewer_email, additional_notes, application_id, admin_email,
    } = req.body || {};

    if (!applicant_email || !applicant_name || !job_title) {
      throw badRequest("applicant_name, applicant_email and job_title are required");
    }

    const interviewerList = Array.isArray(interviewers) && interviewers.length > 0
      ? interviewers
      : interviewer_name || interviewer_email
        ? [{ name: interviewer_name || "", email: interviewer_email || "" }]
        : [];

    const shared = {
      applicantName: applicant_name,
      jobTitle: job_title,
      interviewDate: interview_date,
      interviewTime: interview_time,
      interviewType: interview_type,
      meetLink: meet_link,
      location,
      additionalNotes: additional_notes,
    };

    const candidateHtml = interviewInviteEmail({ ...shared, interviewers: interviewerList });
    const warnings = [];

    const attempt = async (label, params) => {
      try {
        await sendEmail(params);
      } catch (err) {
        warnings.push(`${label}: ${err.message}`);
      }
    };

    await attempt("candidate", {
      to: applicant_email,
      from_name: "TRUV Medical Recruitment",
      subject: `Interview Invitation — ${job_title} | TRUV Medical Services`,
      body: candidateHtml,
    });

    if (admin_email) {
      await attempt("admin", {
        to: admin_email,
        from_name: "TRUV Medical Recruitment (Admin Copy)",
        subject: `[COPY] Interview Invitation — ${applicant_name} — ${job_title}`,
        body: candidateHtml,
      });
    }

    for (const interviewer of interviewerList) {
      if (!interviewer.email) continue;
      await attempt(`interviewer ${interviewer.email}`, {
        to: interviewer.email,
        from_name: "TRUV Medical Recruitment",
        subject: `Interview Assignment — ${applicant_name} | ${job_title}`,
        body: interviewerBriefEmail({ ...shared, interviewerName: interviewer.name }),
      });
    }

    if (application_id) {
      try {
        await prisma.jobApplication.update({
          where: { id: application_id },
          data: { status: "interview" },
        });
        broadcast("JobApplication", { action: "update", id: application_id });
      } catch (err) {
        warnings.push(`status update: ${err.message}`);
      }

      try {
        const names = interviewerList.map((i) => i.name || i.email).filter(Boolean).join(", ");
        const logged = await prisma.candidateMessage.create({
          data: {
            application_id,
            candidate_email: applicant_email,
            candidate_name: applicant_name,
            job_title,
            direction: "outbound",
            subject: `Interview Invitation — ${job_title}`,
            body: `Interview scheduled for ${interview_date} at ${interview_time}. Type: ${interview_type || "Virtual"}${meet_link ? `. Link: ${meet_link}` : ""}${names ? `. Interviewers: ${names}` : ""}`,
            sent_by: req.user.email,
            email_sent: true,
            message_type: "interview_invite",
            created_by: req.user.email,
          },
        });
        broadcast("CandidateMessage", { action: "create", id: logged.id });
      } catch (err) {
        warnings.push(`message log: ${err.message}`);
      }
    }

    res.json({ success: true, warnings: warnings.length > 0 ? warnings : undefined });
  })
);

export default router;
