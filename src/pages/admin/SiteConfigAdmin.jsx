import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SITE_CONFIG_DEFAULTS } from "@/hooks/useSiteConfig";
import { Save, Upload, Globe, Phone, Share2, Image, Bell, Monitor, Link2, Linkedin, Twitter, Facebook, Instagram, Youtube } from "lucide-react";

function ToggleField({ label, description, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? "bg-primary" : "bg-input"}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

const DEFAULTS = SITE_CONFIG_DEFAULTS;

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-heading font-semibold text-base">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <Input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ImageField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <div className="flex gap-2">
        <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="https://..." className="flex-1" />
        <label className="cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <span><Upload className="w-4 h-4 mr-1" />{uploading ? "Uploading..." : "Upload"}</span>
          </Button>
        </label>
      </div>
      {value && (
        <img src={value} alt={label} className="mt-2 h-16 object-contain rounded border border-border" />
      )}
    </div>
  );
}

export default function SiteConfigAdmin() {
  const [config, setConfig] = useState(DEFAULTS);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    api.entities.SiteConfig.filter({ key: "main" }).then((records) => {
      if (records.length > 0) {
        setConfig({ ...DEFAULTS, ...records[0] });
        setRecordId(records[0].id);
      }
    });
  }, []);

  const set = (field) => (val) => setConfig((prev) => ({ ...prev, [field]: val }));

  const handleSave = async () => {
    setSaving(true);
    if (recordId) {
      await api.entities.SiteConfig.update(recordId, config);
    } else {
      const created = await api.entities.SiteConfig.create(config);
      setRecordId(created.id);
    }
    // Immediately refresh all consumers of site config
    queryClient.invalidateQueries({ queryKey: ["site-config"] });
    toast.success("Site configuration saved! Changes are live across the site.");
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Site Configuration</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage global site content, branding, and social media links.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />{saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <SectionCard title="Branding & Logos" icon={Image}>
        <Field label="Company Name" value={config.company_name} onChange={set("company_name")} />
        <Field label="Tagline" value={config.tagline} onChange={set("tagline")} />
        <ImageField label="Main Logo" value={config.logo_url} onChange={set("logo_url")} />
        <ImageField label="Favicon" value={config.favicon_url} onChange={set("favicon_url")} />
      </SectionCard>

      <SectionCard title="Hero Section" icon={Globe}>
        <Field label="Hero Title" value={config.hero_title} onChange={set("hero_title")} />
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Hero Subtitle</label>
          <Textarea value={config.hero_subtitle || ""} onChange={(e) => set("hero_subtitle")(e.target.value)} rows={2} />
        </div>
        <ImageField label="Hero Background Image" value={config.hero_image_url} onChange={set("hero_image_url")} />
        <ImageField label="About Page Image" value={config.about_image_url} onChange={set("about_image_url")} />
        <ImageField label="Dashboard / Portal Banner Image" value={config.dashboard_image_url} onChange={set("dashboard_image_url")} />
        <ImageField label="Digital Health Section Image" value={config.digital_health_image_url} onChange={set("digital_health_image_url")} />
        <ImageField label="Industries Section — Offshore Image" value={config.industries_offshore_image_url} onChange={set("industries_offshore_image_url")} />
        <ImageField label="Industries Section — Industrial Image" value={config.industries_industrial_image_url} onChange={set("industries_industrial_image_url")} />
      </SectionCard>

      <SectionCard title="Services Page Images" icon={Image}>
        <p className="text-xs text-muted-foreground -mt-2">Customize the photo shown for each service on the Services page.</p>
        <ImageField label="Medical Personnel Outsourcing" value={config.service_image_outsourcing} onChange={set("service_image_outsourcing")} />
        <ImageField label="Offshore Medic Deployment" value={config.service_image_offshore} onChange={set("service_image_offshore")} />
        <ImageField label="Clinic Setup & Operations" value={config.service_image_clinic} onChange={set("service_image_clinic")} />
        <ImageField label="Telemedicine Solutions" value={config.service_image_telemedicine} onChange={set("service_image_telemedicine")} />
        <ImageField label="Remote Patient Monitoring" value={config.service_image_monitoring} onChange={set("service_image_monitoring")} />
        <ImageField label="Emergency Medical Support" value={config.service_image_emergency} onChange={set("service_image_emergency")} />
        <ImageField label="Occupational Health Programs" value={config.service_image_occupational} onChange={set("service_image_occupational")} />
        <ImageField label="Medical Equipment Support" value={config.service_image_equipment} onChange={set("service_image_equipment")} />
      </SectionCard>

      <SectionCard title="Contact Information" icon={Phone}>
        <Field label="Phone" value={config.phone} onChange={set("phone")} />
        <div>
          <Field label="24/7 Emergency Phone" value={config.emergency_phone} onChange={set("emergency_phone")} placeholder="+2348000000000" />
          <p className="text-xs text-muted-foreground mt-1">
            This number appears in the <strong>red top banner</strong> on all public pages and in all email footers.
          </p>
          {config.emergency_phone && (
            <div className="mt-2 rounded-lg overflow-hidden border">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-1.5 px-4 text-sm font-medium">
                <span className="font-bold">⚡ 24/7 Emergency Medical Support:</span>
                <span className="font-bold ml-2 underline">{config.emergency_phone}</span>
                <span className="ml-2 hidden sm:inline">| Request Emergency Support →</span>
              </div>
              <p className="text-xs text-muted-foreground text-center py-1 bg-muted/30">^ Live preview of banner</p>
            </div>
          )}
        </div>
        <Field label="Email" value={config.email} onChange={set("email")} type="email" />
        <Field label="Address" value={config.address} onChange={set("address")} />
        <Field label="WhatsApp Number (with country code)" value={config.whatsapp_number} onChange={set("whatsapp_number")} placeholder="+2348000000000" />
      </SectionCard>

      <SectionCard title="Social Media" icon={Share2}>
        <p className="text-xs text-muted-foreground -mt-2">These links appear as clickable icons in the site footer and connect visitors to your social media profiles.</p>
        <Field label="Facebook URL" value={config.facebook_url} onChange={set("facebook_url")} placeholder="https://facebook.com/truvmedical" />
        <Field label="Twitter / X URL" value={config.twitter_url} onChange={set("twitter_url")} placeholder="https://twitter.com/truvmedical" />
        <Field label="LinkedIn URL" value={config.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/company/truvmedical" />
        <Field label="Instagram URL" value={config.instagram_url} onChange={set("instagram_url")} placeholder="https://instagram.com/truvmedical" />
        <Field label="YouTube URL" value={config.youtube_url} onChange={set("youtube_url")} placeholder="https://youtube.com/@truvmedical" />
        {(config.facebook_url || config.twitter_url || config.linkedin_url || config.instagram_url || config.youtube_url) && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Preview (active links):</p>
            <div className="flex items-center gap-2 flex-wrap">
              {config.linkedin_url && <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"><Linkedin className="w-4 h-4 text-primary" /></a>}
              {config.twitter_url && <a href={config.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"><Twitter className="w-4 h-4 text-primary" /></a>}
              {config.facebook_url && <a href={config.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"><Facebook className="w-4 h-4 text-primary" /></a>}
              {config.instagram_url && <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"><Instagram className="w-4 h-4 text-primary" /></a>}
              {config.youtube_url && <a href={config.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"><Youtube className="w-4 h-4 text-primary" /></a>}
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Telemedicine Portal" icon={Monitor}>
        <Field
          label="Telemedicine Portal URL"
          value={config.telemedicine_portal_url}
          onChange={set("telemedicine_portal_url")}
          placeholder="https://portal.truvmedic.com"
        />
        <p className="text-xs text-muted-foreground">When set, a "Telemedicine Portal" button appears on the home page hero and the Technology page, linking users directly to the portal.</p>
        {config.telemedicine_portal_url && (
          <a href={config.telemedicine_portal_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary underline">
            <Link2 className="w-4 h-4" /> Test Portal Link
          </a>
        )}
      </SectionCard>

      <SectionCard title="Features & Subscriptions" icon={Bell}>
        <ToggleField
          label="Newsletter Subscription"
          description="Show newsletter signup form in footer and home page"
          value={config.newsletter_enabled !== false}
          onChange={set("newsletter_enabled")}
        />
        <ToggleField
          label="Blog Subscription"
          description="Allow visitors to subscribe for new blog post alerts"
          value={config.blog_subscription_enabled !== false}
          onChange={set("blog_subscription_enabled")}
        />
        <ToggleField
          label="WhatsApp Job Sharing"
          description="Enable WhatsApp sharing button on job postings in admin"
          value={config.careers_whatsapp_enabled !== false}
          onChange={set("careers_whatsapp_enabled")}
        />
      </SectionCard>

      <SectionCard title="SEO & Footer" icon={Globe}>
        <Field label="SEO Title" value={config.seo_title} onChange={set("seo_title")} />
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">SEO Description</label>
          <Textarea value={config.seo_description || ""} onChange={(e) => set("seo_description")(e.target.value)} rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Footer Text</label>
          <Textarea value={config.footer_text || ""} onChange={(e) => set("footer_text")(e.target.value)} rows={2} />
        </div>
      </SectionCard>
    </div>
  );
}