import React from "react";
import { motion } from "framer-motion";
import SectionHeading from "../shared/SectionHeading";
import { Monitor, Activity, FileText, Wifi, Smartphone, Brain } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const DEFAULT_DASHBOARD_IMAGE = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80";

const features = [
  { icon: Activity, title: "Truv BPConnect", desc: "Remote vital signs monitoring and health data aggregation platform" },
  { icon: Monitor, title: "EMR Integration", desc: "Seamless electronic medical records across all deployment sites" },
  { icon: FileText, title: "Incident Reporting", desc: "Digital incident logging with real-time escalation workflows" },
  { icon: Wifi, title: "Real-Time Monitoring", desc: "Live health dashboards for operations control centers" },
  { icon: Smartphone, title: "Mobile Health App", desc: "Field-ready mobile apps for medics and supervisors" },
  { icon: Brain, title: "AI Health Analytics", desc: "Predictive analytics for workforce health management" },
];

export default function DigitalHealthShowcase() {
  const { config } = useSiteConfig();
  const dashboardImage = config.digital_health_image_url || DEFAULT_DASHBOARD_IMAGE;
  return (
    <section className="py-24 bg-gradient-to-b from-[#0A1628] to-[#0E1F38] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          badge="Technology & Digital Health"
          title="Technology-Driven Healthcare Operations"
          description="Our digital health ecosystem integrates telemedicine, remote monitoring, and AI-powered analytics to deliver proactive, data-driven healthcare management."
          light
        />

        <div className="grid lg:grid-cols-2 gap-16 items-center mt-16">
          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-accent/10">
              <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="ml-4 text-xs text-white/40 font-mono">dashboard.truvmedic.com</div>
              </div>
              <img src={dashboardImage} alt="TRUV Digital Health Dashboard" className="w-full" />
            </div>
            {/* Pulse glow effect */}
            <div className="absolute -inset-1 rounded-2xl bg-accent/20 blur-xl -z-10 animate-pulse-glow" />
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-5 hover:bg-white/15 transition-all duration-300 group"
              >
                <feature.icon className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-heading font-semibold text-white text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-white/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}