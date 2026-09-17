import React from "react";
import { motion } from "framer-motion";
import SectionHeading from "../components/shared/SectionHeading";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { 
  Monitor, Activity, FileText, Brain, CheckCircle, Shield, ExternalLink
} from "lucide-react";

const DASHBOARD_IMAGE = "/__generated_images__/img_7e882126e2fb.png";

const platforms = [
  {
    icon: Activity,
    title: "Truv BPConnect",
    subtitle: "Remote Patient Monitoring Platform",
    description: "Our flagship remote health monitoring platform that enables real-time tracking of vital signs, health trends, and early warning indicators for remote and industrial workers.",
    features: ["Real-time vital signs monitoring", "Automated health alerts", "Trend analysis dashboards", "Multi-device compatibility", "Secure data transmission"],
  },
  {
    icon: Monitor,
    title: "Telemedicine Platform",
    subtitle: "Virtual Healthcare Access",
    description: "Enterprise-grade telemedicine system connecting remote workers with specialist physicians through secure, high-quality video consultations.",
    features: ["HD video consultations", "Multi-specialty access", "Digital prescriptions", "Consultation recording", "Follow-up scheduling"],
  },
  {
    icon: FileText,
    title: "Digital EMR System",
    subtitle: "Electronic Medical Records",
    description: "Comprehensive electronic medical records system designed for occupational health settings, ensuring complete documentation and regulatory compliance.",
    features: ["Cloud-based records", "Regulatory compliance", "Inter-facility sharing", "Automated reporting", "Audit trail tracking"],
  },
  {
    icon: Brain,
    title: "AI Health Analytics",
    subtitle: "Predictive Healthcare Intelligence",
    description: "Machine learning-powered analytics that predict health risks, optimize resource allocation, and identify trends before they become critical issues.",
    features: ["Predictive risk modeling", "Workforce health scoring", "Resource optimization", "Anomaly detection", "Automated insights"],
  },
];

const techStats = [
  { value: "99.9%", label: "Platform Uptime" },
  { value: "256-bit", label: "Data Encryption" },
  { value: "< 3s", label: "Average Response Time" },
  { value: "HIPAA", label: "Compliance Standard" },
];

export default function Technology() {
  const { config } = useSiteConfig();
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-[#0A1628] to-[#0E1F38] overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,188,212,0.5) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
                Technology & Digital Health
              </span>
              <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white leading-tight">
                The Future of Industrial Healthcare, <span className="text-accent">Today</span>
              </h1>
              <p className="text-lg text-white/70 mt-6 leading-relaxed">
                Our digital health ecosystem combines telemedicine, remote monitoring, AI analytics, and secure EMR systems to deliver proactive, data-driven healthcare management.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
                {techStats.map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-4 text-center">
                    <div className="text-xl font-heading font-bold text-accent">{stat.value}</div>
                    <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              {config.telemedicine_portal_url && (
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/25" asChild>
                    <a href={config.telemedicine_portal_url} target="_blank" rel="noopener noreferrer">
                      <Monitor className="w-5 h-5 mr-2" /> Access Telemedicine Portal <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                    <Link to="/contact">Book Demo</Link>
                  </Button>
                </div>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <img src={DASHBOARD_IMAGE} alt="Digital Health Dashboard" className="w-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Our Platforms"
            title="Integrated Digital Health Solutions"
            description="Purpose-built technology platforms designed for the unique demands of industrial and occupational healthcare."
          />
          <div className="space-y-16 mt-16">
            {platforms.map((platform, i) => (
              <motion.div
                key={platform.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl border border-border p-8 lg:p-12"
              >
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                      <platform.icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold mb-1">{platform.title}</h3>
                    <p className="text-sm text-accent font-medium mb-4">{platform.subtitle}</p>
                    <p className="text-muted-foreground leading-relaxed mb-6">{platform.description}</p>
                    <div className="space-y-2">
                      {platform.features.map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                          <span className="text-sm">{f}</span>
                        </div>
                      ))}
                    </div>
                    {platform.title === "Telemedicine Platform" && config.telemedicine_portal_url && (
                      <div className="mt-6">
                        <Button className="bg-accent hover:bg-accent/90 text-white gap-2" asChild>
                          <a href={config.telemedicine_portal_url} target="_blank" rel="noopener noreferrer">
                            <Monitor className="w-4 h-4" /> Access Portal <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className={`${i % 2 === 1 ? "lg:order-1" : ""} bg-gradient-to-br from-accent/5 to-primary/5 rounded-xl p-12 flex items-center justify-center`}>
                    <platform.icon className="w-32 h-32 text-accent/20" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold mb-4">Enterprise-Grade Security</h2>
          <p className="text-muted-foreground mb-8">
            All platforms are built with security-first architecture, featuring end-to-end encryption, role-based access control, HIPAA compliance, and regular security audits.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["256-bit Encryption", "Role-Based Access", "HIPAA Compliant", "Regular Audits", "Data Backup"].map((s) => (
              <div key={s} className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}