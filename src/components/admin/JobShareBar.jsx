import React, { useState } from "react";
import { Twitter, Facebook, Linkedin, MessageCircle, Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const typeLabel = (t) => (t || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const deptLabel = (d) => (d || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export default function JobShareBar({ job }) {
  const [copied, setCopied] = useState(false);
  const { config } = useSiteConfig();

  const careersUrl = `${window.location.origin}/careers?job=${job.id}`;
  const company = config.company_name || "TRUV Medical Services";
  const logoUrl = config.logo_url || "";
  const phone = config.phone || "";
  const email = config.email || "";

  // ── LinkedIn: Professional tone, hashtags, structured ──────────────────────
  const linkedinText = [
    `🏥 ${company} is Hiring!`,
    ``,
    `📌 Role: ${job.title}`,
    `🏢 Department: ${deptLabel(job.department)}`,
    `📍 Location: ${job.location || "Nigeria"}`,
    `💼 Type: ${typeLabel(job.type)}`,
    job.salary_range ? `💰 Salary: ${job.salary_range}` : "",
    job.urgent ? `⚡ URGENT VACANCY` : "",
    ``,
    job.description ? job.description.slice(0, 300) + (job.description.length > 300 ? "..." : "") : "",
    job.certifications_required?.length ? `\n🎓 Required Certs: ${job.certifications_required.slice(0, 3).join(", ")}` : "",
    ``,
    `🔗 Apply Now: ${careersUrl}`,
    ``,
    `#Hiring #${job.department?.replace(/_/g, "")} #OccupationalHealth #MedicalJobs #Nigeria #HealthcareJobs`,
  ].filter(Boolean).join("\n");

  // ── Twitter/X: Short, punchy, under 280 chars ──────────────────────────────
  const twitterText = [
    `${job.urgent ? "⚡ URGENT | " : ""}We're Hiring a ${job.title}!`,
    `📍 ${job.location || "Nigeria"} · ${typeLabel(job.type)}`,
    `👉 Apply: ${careersUrl}`,
    `#MedicalJobs #Hiring`,
  ].join(" ");

  // ── WhatsApp: Casual, emoji-rich, readable on mobile ──────────────────────
  const whatsappText = [
    `🏥 *${company} — Job Opening*`,
    ``,
    `*${job.title}*`,
    `📍 ${job.location || "Nigeria"}`,
    `💼 ${typeLabel(job.type)} | ${deptLabel(job.department)}`,
    job.salary_range ? `💰 ${job.salary_range}` : "",
    job.urgent ? `⚡ *URGENT VACANCY*` : "",
    ``,
    job.description ? `${job.description.slice(0, 200)}...` : "",
    job.requirements?.length ? `\n📋 *Requirements:*\n${job.requirements.slice(0, 3).map(r => `• ${r}`).join("\n")}` : "",
    ``,
    `📲 Apply Now:\n${careersUrl}`,
    phone ? `\n📞 ${phone}` : "",
    email ? `📧 ${email}` : "",
  ].filter(Boolean).join("\n");

  // ── Facebook: Friendly, community-oriented ─────────────────────────────────
  const facebookText = [
    `🚨 JOB ALERT — ${company} is Hiring!`,
    ``,
    `We're looking for a qualified *${job.title}* to join our team.`,
    ``,
    `📍 Location: ${job.location || "Nigeria"}`,
    `💼 Employment: ${typeLabel(job.type)}`,
    job.salary_range ? `💰 ${job.salary_range}` : "",
    ``,
    job.description ? job.description.slice(0, 250) + "..." : "",
    ``,
    `Click the link below to apply or share with someone who qualifies! 👇`,
    `🔗 ${careersUrl}`,
  ].filter(Boolean).join("\n");

  const waNumber = (config.whatsapp_number || "").replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${waNumber || ""}?text=${encodeURIComponent(whatsappText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(careersUrl)}&summary=${encodeURIComponent(linkedinText.slice(0, 700))}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(careersUrl)}&quote=${encodeURIComponent(facebookText.slice(0, 500))}`;

  const handleCopy = (platform) => {
    const texts = { linkedin: linkedinText, twitter: twitterText, whatsapp: whatsappText, facebook: facebookText };
    navigator.clipboard.writeText(texts[platform] || linkedinText);
    setCopied(platform);
    toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} post text copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <Share2 className="w-3 h-3" />Share:
        </span>

        {/* WhatsApp */}
        <div className="flex items-center gap-0.5">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-l-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium border-r border-green-200">
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <button onClick={() => handleCopy("whatsapp")}
            className="text-xs px-1.5 py-1 rounded-r-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors" title="Copy WhatsApp text">
            {copied === "whatsapp" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* LinkedIn */}
        <div className="flex items-center gap-0.5">
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-l-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium border-r border-blue-200">
            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
          </a>
          <button onClick={() => handleCopy("linkedin")}
            className="text-xs px-1.5 py-1 rounded-r-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors" title="Copy LinkedIn post">
            {copied === "linkedin" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Twitter/X */}
        <div className="flex items-center gap-0.5">
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-l-lg bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors font-medium border-r border-sky-200">
            <Twitter className="w-3.5 h-3.5" /> X / Twitter
          </a>
          <button onClick={() => handleCopy("twitter")}
            className="text-xs px-1.5 py-1 rounded-r-lg bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors" title="Copy tweet">
            {copied === "twitter" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Facebook */}
        <div className="flex items-center gap-0.5">
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-l-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors font-medium border-r border-indigo-200">
            <Facebook className="w-3.5 h-3.5" /> Facebook
          </a>
          <button onClick={() => handleCopy("facebook")}
            className="text-xs px-1.5 py-1 rounded-r-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors" title="Copy Facebook post">
            {copied === "facebook" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Preview tip */}
      {logoUrl && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <span className="w-4 h-4 rounded overflow-hidden inline-block border border-border">
            <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
          </span>
          Logo included in link previews via site metadata.
        </p>
      )}
    </div>
  );
}