import React, { useState } from "react";
import { Save, Globe, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// We store site-wide content settings in a SiteConfig entity or as a single record
// Using a simple approach: one Lead with source "content" won't work.
// Instead we use localStorage + a note that these would ideally be a SiteConfig entity.
// For now we manage the Navbar phone/email and hero texts as editable config stored in localStorage.

const DEFAULT_CONFIG = {
  // Hero
  hero_headline: "Expert Medical Teams. Anywhere. Anytime.",
  hero_subheadline: "TRUV Medical Services delivers certified offshore medics, occupational health professionals, and integrated healthcare solutions to Nigeria's most demanding industrial environments.",
  hero_cta_primary: "Request a Consultation",
  hero_cta_secondary: "Explore Our Services",
  // Company Info
  company_tagline: "Nigeria's Premier Occupational Healthcare Partner",
  phone_primary: "+234 803 000 0000",
  phone_secondary: "+234 906 000 0000",
  email_primary: "info@truvmedical.com",
  email_ops: "ops@truvmedical.com",
  address: "Victoria Island, Lagos, Nigeria",
  whatsapp_number: "2348030000000",
  // Emergency Banner
  emergency_banner_text: "24/7 Emergency Medical Response",
  emergency_phone: "+234 800 TRUV 911",
  // Footer
  footer_tagline: "Nigeria's premier partner for occupational health, offshore medical services, and integrated healthcare workforce solutions.",
  // SEO
  site_title: "TRUV Medical Services | Integrated Occupational Healthcare",
  site_description: "TRUV Medical Services Limited provides professional medical personnel outsourcing, clinic setup, telemedicine, and occupational healthcare solutions.",
};

const SECTIONS = [
  {
    title: "Hero Section",
    fields: [
      { key: "hero_headline", label: "Main Headline", type: "text" },
      { key: "hero_subheadline", label: "Sub-headline", type: "textarea" },
      { key: "hero_cta_primary", label: "Primary CTA Button", type: "text" },
      { key: "hero_cta_secondary", label: "Secondary CTA Button", type: "text" },
    ]
  },
  {
    title: "Company Information",
    fields: [
      { key: "company_tagline", label: "Company Tagline", type: "text" },
      { key: "phone_primary", label: "Primary Phone", type: "text" },
      { key: "phone_secondary", label: "Secondary Phone", type: "text" },
      { key: "email_primary", label: "Primary Email", type: "text" },
      { key: "email_ops", label: "Operations Email", type: "text" },
      { key: "address", label: "Office Address", type: "text" },
      { key: "whatsapp_number", label: "WhatsApp Number (digits only)", type: "text" },
    ]
  },
  {
    title: "Emergency Banner",
    fields: [
      { key: "emergency_banner_text", label: "Banner Text", type: "text" },
      { key: "emergency_phone", label: "Emergency Hotline Display", type: "text" },
    ]
  },
  {
    title: "Footer",
    fields: [
      { key: "footer_tagline", label: "Footer Tagline", type: "textarea" },
    ]
  },
  {
    title: "SEO / Meta",
    fields: [
      { key: "site_title", label: "Page Title", type: "text" },
      { key: "site_description", label: "Meta Description", type: "textarea" },
    ]
  },
];

export default function ContentEditor() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("truv_site_config");
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });
  const [saved, setSaved] = useState(false);

  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    localStorage.setItem("truv_site_config", JSON.stringify(config));
    setSaved(true);
    toast.success("Content saved! Changes apply on next page load.");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (!confirm("Reset all content to defaults?")) return;
    localStorage.removeItem("truv_site_config");
    setConfig(DEFAULT_CONFIG);
    toast.success("Reset to defaults");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2"><Globe className="w-6 h-6" />Website Content Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">Edit website text, contact details, and key content areas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>Reset Defaults</Button>
          <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" />{saved ? "Saved!" : "Save Changes"}</Button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Note:</strong> Content is saved to browser storage and served to this device. To implement full CMS-driven content across all users, a SiteConfig entity needs to be added to the backend. Contact your developer for full multi-device CMS setup.
        </div>
      </div>

      {SECTIONS.map(section => (
        <div key={section.title} className="bg-card rounded-xl border p-6 space-y-4">
          <h3 className="font-heading font-semibold text-base">{section.title}</h3>
          <div className="space-y-4">
            {section.fields.map(field => (
              <div key={field.key}>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">{field.label}</label>
                {field.type === "textarea" ? (
                  <Textarea value={config[field.key] || ""} onChange={e => set(field.key, e.target.value)} rows={3} />
                ) : (
                  <Input value={config[field.key] || ""} onChange={e => set(field.key, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} size="lg" className="gap-2"><Save className="w-4 h-4" />{saved ? "Saved!" : "Save All Changes"}</Button>
      </div>
    </div>
  );
}