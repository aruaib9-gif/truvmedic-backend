/**
 * Entity registry — the single source of truth for the generic /api/entities router.
 *
 * access levels (lowest to highest):
 *   "public" — no token needed
 *   "auth"   — any signed-in user (includes applicants)
 *   "staff"  — signed-in user whose role is admin | recruiter | manager | viewer
 *   "admin"  — signed-in user whose role is admin
 */

export const STAFF_ROLES = ["admin", "recruiter", "manager", "viewer"];

/** Fields a client may write. Anything else in the payload is dropped. */
const leadFields = [
  "full_name", "email", "phone", "company", "industry", "country",
  "service_interest", "employee_count", "project_type", "message",
  "source", "status", "priority", "emergency_support", "newsletter_subscribed",
];

const emergencyFields = [
  "contact_name", "company", "phone", "email", "location",
  "emergency_type", "description", "urgency", "status",
];

const jobPostingFields = [
  "title", "department", "location", "type", "description", "requirements",
  "certifications_required", "salary_range", "active", "urgent",
];

const jobApplicationFields = [
  "job_id", "job_title", "full_name", "email", "phone", "resume_url",
  "cover_letter", "certifications", "cert_document_urls", "cert_verified",
  "years_experience", "offshore_certified", "available_date", "status",
  "recruiter_notes", "tags", "department",
];

const candidateMessageFields = [
  "application_id", "candidate_email", "candidate_name", "job_title",
  "direction", "subject", "body", "sent_by", "email_sent", "message_type",
];

const internalMessageFields = [
  "from_user_id", "from_user_name", "from_user_email", "to_user_id",
  "to_user_name", "to_user_email", "subject", "body", "read", "priority", "thread_id",
];

const blogPostFields = [
  "title", "slug", "excerpt", "content", "cover_image", "category", "tags",
  "author_name", "author_role", "published", "published_date", "read_time",
];

const testimonialFields = [
  "client_name", "company", "role", "content", "rating", "industry", "featured",
];

const newsletterFields = ["email", "full_name", "subscribed", "source"];

const siteConfigFields = [
  "key", "company_name", "tagline", "logo_url", "favicon_url", "hero_title",
  "hero_subtitle", "hero_image_url", "about_image_url", "dashboard_image_url",
  "digital_health_image_url", "industries_offshore_image_url",
  "industries_industrial_image_url", "service_image_outsourcing",
  "service_image_offshore", "service_image_clinic", "service_image_telemedicine",
  "service_image_monitoring", "service_image_emergency",
  "service_image_occupational", "service_image_equipment", "phone", "email",
  "address", "emergency_phone", "whatsapp_number", "facebook_url", "twitter_url",
  "linkedin_url", "instagram_url", "youtube_url", "footer_text", "seo_title",
  "seo_description", "telemedicine_portal_url", "newsletter_enabled",
  "blog_subscription_enabled", "careers_whatsapp_enabled",
];

const userFields = ["role", "department", "phone", "active", "notes", "intended_role", "full_name"];

export const ENTITIES = {
  Lead: {
    model: "lead",
    fields: leadFields,
    access: { read: "staff", create: "public", update: "staff", delete: "admin" },
  },
  EmergencyRequest: {
    model: "emergencyRequest",
    fields: emergencyFields,
    access: { read: "staff", create: "public", update: "staff", delete: "admin" },
  },
  JobPosting: {
    model: "jobPosting",
    fields: jobPostingFields,
    access: { read: "public", create: "staff", update: "staff", delete: "admin" },
  },
  JobApplication: {
    model: "jobApplication",
    fields: jobApplicationFields,
    access: { read: "auth", create: "public", update: "staff", delete: "admin" },
    // Applicants may only ever see their own applications.
    ownerScope: (user) => (user.role === "applicant" ? { email: user.email } : null),
  },
  CandidateMessage: {
    model: "candidateMessage",
    fields: candidateMessageFields,
    access: { read: "auth", create: "staff", update: "staff", delete: "admin" },
    ownerScope: (user) => (user.role === "applicant" ? { candidate_email: user.email } : null),
  },
  InternalMessage: {
    model: "internalMessage",
    fields: internalMessageFields,
    access: { read: "staff", create: "staff", update: "staff", delete: "admin" },
  },
  BlogPost: {
    model: "blogPost",
    fields: blogPostFields,
    access: { read: "public", create: "staff", update: "staff", delete: "admin" },
    // Unauthenticated visitors only ever see published posts.
    publicScope: { published: true },
  },
  Testimonial: {
    model: "testimonial",
    fields: testimonialFields,
    access: { read: "public", create: "staff", update: "staff", delete: "admin" },
  },
  NewsletterSubscriber: {
    model: "newsletterSubscriber",
    fields: newsletterFields,
    access: { read: "staff", create: "public", update: "staff", delete: "admin" },
    // Re-subscribing with a known address must not blow up on the unique index.
    upsertOn: "email",
  },
  SiteConfig: {
    model: "siteConfig",
    fields: siteConfigFields,
    access: { read: "public", create: "admin", update: "admin", delete: "admin" },
    upsertOn: "key",
  },
  User: {
    model: "user",
    fields: userFields,
    access: { read: "staff", create: "admin", update: "admin", delete: "admin" },
    // Never leak password hashes through the generic router.
    omit: ["password_hash"],
  },
};

export const getEntity = (name) => ENTITIES[name] || null;

/** Does `user` satisfy the required access level? */
export function satisfies(level, user) {
  if (level === "public") return true;
  if (!user) return false;
  if (level === "auth") return true;
  if (level === "staff") return STAFF_ROLES.includes(user.role);
  if (level === "admin") return user.role === "admin";
  return false;
}

/** Strip a record of fields that must never reach the client. */
export function sanitize(record, entity) {
  if (!record || !entity.omit) return record;
  const clone = { ...record };
  for (const key of entity.omit) delete clone[key];
  return clone;
}
