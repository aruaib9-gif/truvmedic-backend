/**
 * End-to-end smoke test for the TRUV Medical API.
 * Usage: API=http://localhost:4010 node scripts/smoke.mjs
 * Expects a seeded admin (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD).
 */
import "dotenv/config";

const API = process.env.API || `http://localhost:${process.env.PORT || 4000}`;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@truvmedic.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "devpassword123";

let passed = 0;
let failed = 0;

async function call(method, path, { token, body, raw } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body && !raw ? { "Content-Type": "application/json" } : {}),
    },
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  return { status: res.status, data };
}

function check(name, expected, actual, detail) {
  if (expected === actual) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${name} — expected ${expected}, got ${actual}`);
    if (detail) console.log(`       ${JSON.stringify(detail)}`);
  }
}

function section(title) {
  console.log(`\n== ${title} ==`);
}

const unique = Date.now();

async function run() {
  section("auth");
  check("login rejects bad password", 401,
    (await call("POST", "/api/auth/login", { body: { email: ADMIN_EMAIL, password: "wrong" } })).status);

  const login = await call("POST", "/api/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  check("login succeeds", 200, login.status, login.data);
  const admin = login.data.token;
  if (!admin) throw new Error("Cannot continue without an admin token");

  check("token never returns the hash", true, !("password_hash" in (login.data.user || {})));
  check("/me with token", 200, (await call("GET", "/api/auth/me", { token: admin })).status);
  check("/me anonymous", 401, (await call("GET", "/api/auth/me")).status);

  const applicantEmail = `applicant${unique}@example.com`;
  const reg = await call("POST", "/api/auth/register", {
    body: { email: applicantEmail, password: "applicant123", full_name: "Jane Doe" },
  });
  check("register applicant", 201, reg.status, reg.data);
  check("new sign-ups default to applicant", "applicant", reg.data?.user?.role);
  const applicant = reg.data.token;

  check("duplicate registration rejected", 400,
    (await call("POST", "/api/auth/register", { body: { email: applicantEmail, password: "applicant123", full_name: "Jane" } })).status);
  check("weak password rejected", 400,
    (await call("POST", "/api/auth/register", { body: { email: `x${unique}@example.com`, password: "short", full_name: "X" } })).status);
  check("forgot-password never enumerates", 200,
    (await call("POST", "/api/auth/forgot-password", { body: { email: "nobody@nowhere.test" } })).status);

  section("public reads");
  const config = await call("GET", `/api/entities/SiteConfig?filter=${encodeURIComponent(JSON.stringify({ key: "main" }))}`);
  check("SiteConfig readable anonymously", 200, config.status);
  check("SiteConfig 'main' exists", 1, config.data?.length);
  check("JobPosting readable anonymously", 200, (await call("GET", "/api/entities/JobPosting")).status);
  check("unknown entity 404s", 404, (await call("GET", "/api/entities/Nope")).status);
  check("Lead list blocked anonymously", 401, (await call("GET", "/api/entities/Lead")).status);

  section("public creates");
  const lead = await call("POST", "/api/entities/Lead", {
    body: { full_name: "Acme Buyer", email: "buyer@acme.com", company: "Acme", source: "contact_form", id: "spoofed-id" },
  });
  check("Lead create anonymous", 201, lead.status, lead.data);
  check("client-supplied id ignored", false, lead.data?.id === "spoofed-id");
  const leadId = lead.data.id;

  check("EmergencyRequest create anonymous", 201,
    (await call("POST", "/api/entities/EmergencyRequest", { body: { contact_name: "Rig Lead", phone: "+2348000", emergency_type: "medical_emergency" } })).status);

  const subEmail = `sub${unique}@example.com`;
  check("newsletter signup", 201,
    (await call("POST", "/api/entities/NewsletterSubscriber", { body: { email: subEmail, source: "footer" } })).status);
  check("re-subscribing upserts instead of 409", 201,
    (await call("POST", "/api/entities/NewsletterSubscriber", { body: { email: subEmail, source: "newsletter_section" } })).status);

  section("write authorisation");
  check("Lead update anonymous blocked", 401,
    (await call("PUT", `/api/entities/Lead/${leadId}`, { body: { status: "contacted" } })).status);
  check("Lead update by applicant blocked", 403,
    (await call("PUT", `/api/entities/Lead/${leadId}`, { token: applicant, body: { status: "contacted" } })).status);
  check("Lead update by admin", 200,
    (await call("PUT", `/api/entities/Lead/${leadId}`, { token: admin, body: { status: "contacted" } })).status);
  check("sort on unknown field rejected", 400,
    (await call("GET", "/api/entities/Lead?sort=-nonexistent", { token: admin })).status);
  check("filter on unknown field rejected", 400,
    (await call("GET", `/api/entities/Lead?filter=${encodeURIComponent('{"evil":1}')}`, { token: admin })).status);

  section("recruitment flow");
  const job = await call("POST", "/api/entities/JobPosting", {
    token: admin,
    body: { title: "Offshore Medic", department: "offshore_medical", requirements: ["BOSIET", "5 yrs"], active: true },
  });
  check("create job posting", 201, job.status, job.data);
  check("array field round-trips", 2, job.data?.requirements?.length);

  const application = await call("POST", "/api/entities/JobApplication", {
    body: {
      job_id: job.data.id,
      job_title: "Offshore Medic",
      full_name: "Jane Doe",
      email: applicantEmail,
      years_experience: "7",
      certifications: ["BOSIET"],
      cert_document_urls: { BOSIET: "https://example.com/cert.pdf" },
    },
  });
  check("apply anonymously", 201, application.status, application.data);
  check("numeric string coerced to number", 7, application.data?.years_experience);
  check("JSON map field round-trips", "https://example.com/cert.pdf", application.data?.cert_document_urls?.BOSIET);
  const applicationId = application.data.id;

  const mine = await call("GET", "/api/entities/JobApplication", { token: applicant });
  check("applicant sees their application", 1, mine.data?.length);

  const otherReg = await call("POST", "/api/auth/register", {
    body: { email: `other${unique}@example.com`, password: "applicant123", full_name: "Other Person" },
  });
  const others = await call("GET", "/api/entities/JobApplication", { token: otherReg.data.token });
  check("other applicants see nothing", 0, others.data?.length);

  check("staff updates application status", 200,
    (await call("PUT", `/api/entities/JobApplication/${applicationId}`, { token: admin, body: { status: "shortlisted" } })).status);
  check("applicant cannot update their status", 403,
    (await call("PUT", `/api/entities/JobApplication/${applicationId}`, { token: applicant, body: { status: "hired" } })).status);

  section("user management");
  const users = await call("GET", "/api/entities/User", { token: admin });
  check("staff can list users", 200, users.status);
  check("password hashes never leak", false, (users.data || []).some((u) => "password_hash" in u));
  check("applicant cannot list users", 403, (await call("GET", "/api/entities/User", { token: applicant })).status);
  check("invite requires admin", 403,
    (await call("POST", "/api/users/invite", { token: applicant, body: { email: "new@truvmedic.com", role: "recruiter" } })).status);
  const invite = await call("POST", "/api/users/invite", {
    token: admin, body: { email: `recruiter${unique}@truvmedic.com`, role: "recruiter" },
  });
  check("admin invites staff", 201, invite.status, invite.data);
  const invites = await call("GET", "/api/users/invites", { token: admin });
  check("pending invites listed", true, (invites.data || []).length > 0);
  check("invite tokens are not exposed", false, JSON.stringify(invites.data).includes("token_hash"));

  section("integrations");
  check("LLM proxy answers", 200, (await call("POST", "/api/integrations/llm", { body: { prompt: "hello" } })).status);
  check("LLM requires a prompt", 400, (await call("POST", "/api/integrations/llm", { body: {} })).status);
  check("LLM rejects oversized prompts", 400,
    (await call("POST", "/api/integrations/llm", { body: { prompt: "x".repeat(9000) } })).status);
  check("email endpoint requires staff", 401,
    (await call("POST", "/api/integrations/email", { body: { to: "a@b.com", subject: "hi" } })).status);
  check("upload rejects empty request", 400,
    (await call("POST", "/api/integrations/upload", { raw: new FormData() })).status);

  section("server functions");
  check("notifyNewApplication", 200,
    (await call("POST", "/api/functions/notifyNewApplication", {
      body: { applicant_name: "Jane", applicant_email: applicantEmail, job_title: "Offshore Medic" },
    })).status);
  check("notifyNewApplication validates input", 400,
    (await call("POST", "/api/functions/notifyNewApplication", { body: { applicant_name: "Jane" } })).status);
  check("sendCandidateMessage requires staff", 401,
    (await call("POST", "/api/functions/sendCandidateMessage", {
      body: { application_id: applicationId, candidate_email: applicantEmail, message_body: "hi" },
    })).status);

  const message = await call("POST", "/api/functions/sendCandidateMessage", {
    token: admin,
    body: {
      application_id: applicationId, candidate_email: applicantEmail, candidate_name: "Jane",
      job_title: "Offshore Medic", message_body: "Thanks for applying.",
    },
  });
  check("sendCandidateMessage as staff", 200, message.status, message.data);

  const logged = await call("GET", `/api/entities/CandidateMessage?filter=${encodeURIComponent(JSON.stringify({ application_id: applicationId }))}`, { token: admin });
  check("message logged to the database", 1, logged.data?.length);

  const interview = await call("POST", "/api/functions/sendInterviewInvite", {
    token: admin,
    body: {
      application_id: applicationId, applicant_name: "Jane", applicant_email: applicantEmail,
      job_title: "Offshore Medic", interview_date: "2026-10-01", interview_time: "10:00",
      interviewers: [{ name: "Dr A", email: "dra@truvmedic.com" }],
    },
  });
  check("sendInterviewInvite as staff", 200, interview.status, interview.data);

  const afterInvite = await call("GET", `/api/entities/JobApplication/${applicationId}`, { token: admin });
  check("invite advances status to interview", "interview", afterInvite.data?.status);

  section("deletes");
  check("applicant cannot delete", 403, (await call("DELETE", `/api/entities/Lead/${leadId}`, { token: applicant })).status);
  check("admin deletes", 200, (await call("DELETE", `/api/entities/Lead/${leadId}`, { token: admin })).status);
  check("deleting twice 404s", 404, (await call("DELETE", `/api/entities/Lead/${leadId}`, { token: admin })).status);

  console.log(`\npassed: ${passed}   failed: ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch((err) => {
  console.error("\nsmoke test crashed:", err);
  process.exit(1);
});
