import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CTASection from "../components/home/CTASection";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { 
  Users, Anchor, Building2, Monitor, Activity, AlertTriangle, 
  HeartPulse, Wrench, ArrowRight, CheckCircle 
} from "lucide-react";

const SERVICE_DEFAULTS = {
  outsourcing: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80",
  offshore: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
  clinic: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
  telemedicine: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  monitoring: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80",
  emergency: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
  occupational: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
  equipment: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
};

const SERVICE_DEFS = [
  {
    id: "outsourcing",
    icon: Users,
    title: "Medical Personnel Outsourcing",
    description: "We provide highly qualified, vetted, and certified medical professionals for deployment across industrial operations. Our personnel undergo rigorous screening, credential verification, and continuous training.",
    features: ["Credential verification & background checks", "Continuous professional development", "Flexible deployment models", "Rapid replacement guarantees", "Performance monitoring & reporting"],
  },
  {
    id: "offshore",
    icon: Anchor,
    title: "Offshore Medic Deployment",
    description: "Certified offshore medics trained for the unique challenges of marine and platform environments. BOSIET, HUET, and all required offshore certifications maintained.",
    features: ["BOSIET/HUET certified medics", "Rotational deployment schedules", "Emergency evacuation trained", "Marine medical specialists", "Platform-ready medical kits"],
  },
  {
    id: "clinic",
    icon: Building2,
    title: "Clinic Setup & Operations Management",
    description: "End-to-end clinic design, setup, equipping, staffing, and daily operations management. We build and run medical facilities that meet international standards.",
    features: ["Facility design & layout planning", "Medical equipment procurement", "Full staffing & operations", "Quality management systems", "Regulatory compliance"],
  },
  {
    id: "telemedicine",
    icon: Monitor,
    title: "Telemedicine Solutions",
    description: "Remote consultation platforms connecting your workforce with specialist physicians regardless of location. Enabling access to quality healthcare anywhere.",
    features: ["24/7 specialist access", "Multi-specialty consultations", "Secure video conferencing", "Digital prescription management", "Follow-up care coordination"],
  },
  {
    id: "monitoring",
    icon: Activity,
    title: "Remote Patient Monitoring",
    description: "Real-time health data monitoring with Truv BPConnect platform. Proactive healthcare management that identifies risks before they become emergencies.",
    features: ["Vital signs monitoring", "Real-time health dashboards", "Automated alert systems", "Trend analysis & reporting", "Integration with existing systems"],
  },
  {
    id: "emergency",
    icon: AlertTriangle,
    title: "Emergency Medical Support",
    description: "Rapid response medical teams with pre-positioned equipment and established protocols for industrial emergencies. 24/7 availability with guaranteed response times.",
    features: ["24/7 rapid response teams", "Pre-positioned medical equipment", "Emergency evacuation support", "Incident management protocols", "Post-incident care & reporting"],
  },
  {
    id: "occupational",
    icon: HeartPulse,
    title: "Occupational Health Programs",
    description: "Comprehensive workplace health management including fitness-to-work assessments, drug & alcohol testing, health surveillance, and wellness programs.",
    features: ["Pre-employment medical screening", "Fitness-to-work assessments", "Drug & alcohol testing", "Health surveillance programs", "Wellness & prevention campaigns"],
  },
  {
    id: "equipment",
    icon: Wrench,
    title: "Medical Equipment Support",
    description: "Full lifecycle management of medical and emergency equipment—procurement, installation, training, calibration, and maintenance.",
    features: ["Equipment procurement & sourcing", "Installation & commissioning", "Staff training on equipment", "Calibration & maintenance", "Emergency kit management"],
  },
];

export default function Services() {
  const { config } = useSiteConfig();
  const services = SERVICE_DEFS.map(s => ({
    ...s,
    image: config[`service_image_${s.id}`] || SERVICE_DEFAULTS[s.id],
  }));
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-[#0A1628] to-[#1B3A5C] overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,188,212,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">Our Services</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight max-w-3xl">
              End-to-End Healthcare Solutions for Industry
            </h1>
            <p className="text-lg text-white/70 mt-6 max-w-2xl">
              From personnel deployment to technology-driven health management, we deliver comprehensive occupational healthcare solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                className="grid lg:grid-cols-2 gap-10 items-center"
              >
                {/* Text */}
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">{service.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                  <div className="grid sm:grid-cols-2 gap-2 mb-8">
                    {service.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button asChild>
                    <Link to="/contact">
                      Request This Service <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
                {/* Image */}
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <service.icon className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">{service.title}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}