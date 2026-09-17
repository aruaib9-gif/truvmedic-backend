import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/api/client";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { 
  MapPin, Phone, Mail, Clock, ArrowRight, Linkedin, 
  Twitter, Facebook, Instagram, Youtube, Shield, ExternalLink
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const { config } = useSiteConfig();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    await api.entities.NewsletterSubscriber.create({ email, full_name: "Newsletter Subscriber", subscribed: true, source: "footer" });
    toast.success("Subscribed successfully!");
    setEmail("");
    setSubscribing(false);
  };

  return (
    <footer className="bg-gradient-to-b from-[#0A1628] to-[#060D18] text-white">
      {/* Newsletter Banner */}
      {config.newsletter_enabled !== false && (
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-heading font-bold">Stay Informed</h3>
                <p className="text-white/60 mt-1">Get the latest in occupational healthcare & industry insights.</p>
              </div>
              <form onSubmit={handleSubscribe} className="flex gap-3 w-full lg:w-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-w-[280px]"
                />
                <Button type="submit" disabled={subscribing} className="bg-accent hover:bg-accent/90 text-white shrink-0">
                  Subscribe <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <img 
              src={config.logo_url || "/logo.png"} 
              alt={config.company_name || "TRUV Medical"} 
              className="h-14 object-contain mb-4"
            />
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {config.footer_text || "Professional medical personnel outsourcing, clinic setup, and end-to-end clinic operations management."}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {config.linkedin_url && (
                <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {config.twitter_url && (
                <a href={config.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {config.facebook_url && (
                <a href={config.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {config.instagram_url && (
                <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {config.youtube_url && (
                <a href={config.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-6">Quick Links</h4>
            <div className="space-y-3">
              {[
                { label: "About Us", path: "/about" },
                { label: "Our Services", path: "/services" },
                { label: "Industries", path: "/industries" },
                { label: "Technology", path: "/technology" },
                { label: "Careers", path: "/careers" },
                { label: "Contact Us", path: "/contact" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="block text-sm text-white/60 hover:text-accent transition-colors">
                  {link.label}
                </Link>
              ))}
              {config.telemedicine_portal_url && (
                <a href={config.telemedicine_portal_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors font-medium">
                  Telemedicine Portal <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold mb-6">Services</h4>
            <div className="space-y-3">
              {[
                "Medical Personnel Outsourcing",
                "Offshore Medic Deployment",
                "Clinic Setup & Operations",
                "Telemedicine Solutions",
                "Emergency Medical Support",
                "Occupational Health Programs",
              ].map((s) => (
                <Link key={s} to="/services" className="block text-sm text-white/60 hover:text-accent transition-colors">
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-semibold mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-accent shrink-0" />
                <span className="text-sm text-white/60">{config.address || "Lagos, Nigeria"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-1 text-accent shrink-0" />
                <span className="text-sm text-white/60">{config.phone || "+234 800 000 0000"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 text-accent shrink-0" />
                <span className="text-sm text-white/60">{config.email || "info@truvmedic.com"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 text-accent shrink-0" />
                <span className="text-sm text-white/60">24/7 Emergency Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span>© {new Date().getFullYear()} {config.company_name || "TRUV Medical Services Limited"}. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/40">
              <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}