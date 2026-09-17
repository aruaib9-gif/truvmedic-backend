import React, { useState } from "react";
import { Shield, Check, X, Info, ChevronDown, ChevronUp } from "lucide-react";

const ROLES = ["admin", "recruiter", "manager", "viewer"];

const ROLE_META = {
  admin: { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500", label: "Administrator" },
  recruiter: { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500", label: "Recruiter" },
  manager: { color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500", label: "Manager" },
  viewer: { color: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400", label: "Viewer" },
};

// Full permission matrix — true = allowed, false = denied
const PERMISSIONS = [
  {
    category: "Dashboard & Overview",
    items: [
      { key: "view_dashboard", label: "View admin dashboard", admin: true, recruiter: true, manager: true, viewer: true },
      { key: "view_analytics", label: "View analytics & stats", admin: true, recruiter: false, manager: true, viewer: true },
    ],
  },
  {
    category: "Leads & CRM",
    items: [
      { key: "view_leads", label: "View all leads", admin: true, recruiter: false, manager: true, viewer: true },
      { key: "create_leads", label: "Create new leads", admin: true, recruiter: false, manager: true, viewer: false },
      { key: "edit_leads", label: "Edit/update leads", admin: true, recruiter: false, manager: true, viewer: false },
      { key: "delete_leads", label: "Delete leads", admin: true, recruiter: false, manager: false, viewer: false },
    ],
  },
  {
    category: "Job Applications & Recruitment",
    items: [
      { key: "view_applications", label: "View job applications", admin: true, recruiter: true, manager: true, viewer: true },
      { key: "update_app_status", label: "Update application status", admin: true, recruiter: true, manager: true, viewer: false },
      { key: "send_candidate_msg", label: "Message candidates", admin: true, recruiter: true, manager: false, viewer: false },
      { key: "send_interview", label: "Send interview invitations", admin: true, recruiter: true, manager: false, viewer: false },
      { key: "view_resume", label: "View/download resumes & docs", admin: true, recruiter: true, manager: true, viewer: true },
      { key: "verify_certs", label: "Verify certifications", admin: true, recruiter: true, manager: false, viewer: false },
      { key: "add_tags", label: "Add/remove recruiter tags", admin: true, recruiter: true, manager: true, viewer: false },
    ],
  },
  {
    category: "Job Postings",
    items: [
      { key: "view_jobs", label: "View job postings", admin: true, recruiter: true, manager: true, viewer: true },
      { key: "create_jobs", label: "Create new job postings", admin: true, recruiter: true, manager: false, viewer: false },
      { key: "edit_jobs", label: "Edit job postings", admin: true, recruiter: true, manager: false, viewer: false },
      { key: "toggle_jobs", label: "Activate/deactivate postings", admin: true, recruiter: true, manager: false, viewer: false },
      { key: "delete_jobs", label: "Delete job postings", admin: true, recruiter: false, manager: false, viewer: false },
    ],
  },
  {
    category: "Emergency Requests",
    items: [
      { key: "view_emergencies", label: "View emergency requests", admin: true, recruiter: false, manager: true, viewer: true },
      { key: "update_emergency", label: "Update emergency status", admin: true, recruiter: false, manager: true, viewer: false },
      { key: "delete_emergency", label: "Delete emergency records", admin: true, recruiter: false, manager: false, viewer: false },
    ],
  },
  {
    category: "Blog & Content",
    items: [
      { key: "view_blog", label: "View blog posts", admin: true, recruiter: false, manager: true, viewer: true },
      { key: "create_blog", label: "Create & edit blog posts", admin: true, recruiter: false, manager: true, viewer: false },
      { key: "publish_blog", label: "Publish/unpublish posts", admin: true, recruiter: false, manager: false, viewer: false },
      { key: "edit_content", label: "Edit site content sections", admin: true, recruiter: false, manager: false, viewer: false },
    ],
  },
  {
    category: "Internal Messaging",
    items: [
      { key: "send_internal_msg", label: "Send internal messages to staff", admin: true, recruiter: true, manager: true, viewer: true },
      { key: "view_all_messages", label: "View all staff messages (admin oversight)", admin: true, recruiter: false, manager: false, viewer: false },
    ],
  },
  {
    category: "Settings & Configuration",
    items: [
      { key: "view_site_config", label: "View site configuration", admin: true, recruiter: false, manager: false, viewer: false },
      { key: "edit_site_config", label: "Edit site settings & branding", admin: true, recruiter: false, manager: false, viewer: false },
      { key: "edit_contact_details", label: "Update contact details & emergency numbers", admin: true, recruiter: false, manager: false, viewer: false },
    ],
  },
  {
    category: "User Management",
    items: [
      { key: "view_users", label: "View all users", admin: true, recruiter: false, manager: false, viewer: false },
      { key: "invite_users", label: "Invite new users", admin: true, recruiter: false, manager: false, viewer: false },
      { key: "edit_user_roles", label: "Assign & edit user roles", admin: true, recruiter: false, manager: false, viewer: false },
      { key: "deactivate_users", label: "Deactivate user accounts", admin: true, recruiter: false, manager: false, viewer: false },
    ],
  },
];

const Tick = ({ value }) =>
  value
    ? <Check className="w-4 h-4 text-green-600" />
    : <X className="w-4 h-4 text-red-400 opacity-50" />;

export default function RolePermissions() {
  const [expanded, setExpanded] = useState({});

  const toggle = (cat) => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-heading font-bold">Role & Permissions Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of access rights for each role across all system modules. Contact a developer to modify role permissions.</p>
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ROLES.map(role => (
          <div key={role} className={`rounded-xl border p-4 ${ROLE_META[role].color}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${ROLE_META[role].dot}`} />
              <span className="font-semibold text-sm capitalize">{ROLE_META[role].label}</span>
            </div>
            <p className="text-xs opacity-75 leading-relaxed">
              {role === "admin" && "Full system access. Can manage all data, users, and configuration."}
              {role === "recruiter" && "Focus on recruitment: applications, job postings, and candidate messaging."}
              {role === "manager" && "Operational oversight. Can view and update leads, applications, and emergencies."}
              {role === "viewer" && "Read-only access to assigned sections. Cannot create, edit, or delete."}
            </p>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="bg-card rounded-xl border overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-12 bg-muted/50 border-b px-4 py-3">
          <div className="col-span-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Permission</div>
          {ROLES.map(r => (
            <div key={r} className="col-span-1 md:col-span-1 text-center hidden md:flex items-center justify-center">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ROLE_META[r].color}`}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </span>
            </div>
          ))}
          <div className="col-span-6 flex md:hidden items-center justify-end gap-2">
            {ROLES.map(r => (
              <span key={r} className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${ROLE_META[r].color}`}>
                {r[0].toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {PERMISSIONS.map(section => (
          <div key={section.category} className="border-b last:border-0">
            <button
              onClick={() => toggle(section.category)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">{section.category}</span>
                <span className="text-xs text-muted-foreground">({section.items.length} permissions)</span>
              </div>
              {expanded[section.category]
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {expanded[section.category] && (
              <div className="divide-y border-t bg-muted/10">
                {section.items.map(perm => (
                  <div key={perm.key} className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-muted/20">
                    <div className="col-span-6 text-sm text-foreground/80">{perm.label}</div>
                    {ROLES.map(r => (
                      <div key={r} className="col-span-1 hidden md:flex justify-center">
                        <Tick value={perm[r]} />
                      </div>
                    ))}
                    <div className="col-span-6 flex md:hidden items-center justify-end gap-3">
                      {ROLES.map(r => (
                        <span key={r} title={r} className="flex items-center justify-center">
                          <Tick value={perm[r]} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Role-based permissions are enforced at the database level.</p>
          <p className="text-xs text-amber-700 mt-1">
            This matrix reflects the intended access control policy. UI elements are conditionally rendered per role. 
            To modify role definitions or add custom roles, update the User entity schema and this configuration.
          </p>
        </div>
      </div>
    </div>
  );
}