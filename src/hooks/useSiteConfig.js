import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useEffect } from "react";

export const SITE_CONFIG_DEFAULTS = {
  key: "main",
  company_name: "TRUV Medical Services Limited",
  tagline: "Integrated Occupational Healthcare & Medical Workforce Solutions",
  logo_url: "/logo.png",
  favicon_url: "/favicon.jpg",
  hero_title: "Integrated Occupational Healthcare & Medical Workforce Solutions",
  hero_subtitle: "24/7 medical readiness, offshore & industrial healthcare, full regulatory compliance, and technology-driven operations for enterprises that never stop.",
  hero_image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&q=80",
  about_image_url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=900&q=80",
  digital_health_image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  industries_offshore_image_url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
  industries_industrial_image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
  service_image_outsourcing: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80",
  service_image_offshore: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
  service_image_clinic: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
  service_image_telemedicine: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  service_image_monitoring: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80",
  service_image_emergency: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
  service_image_occupational: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
  service_image_equipment: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
  phone: "+234 800 000 0000",
  email: "info@truvmedic.com",
  address: "Lagos, Nigeria",
  facebook_url: "",
  twitter_url: "",
  linkedin_url: "",
  instagram_url: "",
  youtube_url: "",
  whatsapp_number: "+2348000000000",
  emergency_phone: "+234 800 000 0000",
  footer_text: "Professional medical personnel outsourcing, clinic setup, and end-to-end clinic operations management for oil & gas, manufacturing, and corporate organizations.",
  seo_title: "TRUV Medical Services | Occupational Healthcare Solutions",
  seo_description: "TRUV Medical Services Limited provides professional medical personnel outsourcing, clinic setup, telemedicine, and occupational healthcare solutions.",
  telemedicine_portal_url: "",
  newsletter_enabled: true,
  blog_subscription_enabled: true,
  careers_whatsapp_enabled: true,
};

/**
 * Overlays a stored config onto the defaults, ignoring null/empty fields.
 *
 * A SiteConfig row only ever holds the fields an admin has actually filled in;
 * a plain spread would let those nulls erase perfectly good defaults (logo,
 * hero copy, stock imagery) and leave the page half-blank.
 */
function mergeWithDefaults(stored) {
  const merged = { ...SITE_CONFIG_DEFAULTS };
  for (const [key, value] of Object.entries(stored)) {
    if (value === null || value === undefined || value === "") continue;
    merged[key] = value;
  }
  return merged;
}

export function useSiteConfig() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const configs = await api.entities.SiteConfig.filter({ key: "main" });
      return configs.length > 0 ? mergeWithDefaults(configs[0]) : SITE_CONFIG_DEFAULTS;
    },
    initialData: SITE_CONFIG_DEFAULTS,
    staleTime: 30 * 1000,
  });

  // Real-time subscription — any update to SiteConfig invalidates the cache immediately
  useEffect(() => {
    const unsubscribe = api.entities.SiteConfig.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
    });
    return unsubscribe;
  }, [queryClient]);

  return { config: data ?? SITE_CONFIG_DEFAULTS, isLoading };
}