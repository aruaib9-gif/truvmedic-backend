import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeading from "../shared/SectionHeading";
import { 
  Users, Anchor, Building2, Monitor, Activity, AlertTriangle, 
  HeartPulse, Wrench, ArrowRight 
} from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Medical Personnel Outsourcing",
    description: "Skilled medical professionals deployed to your operations with full credential verification and compliance assurance.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Anchor,
    title: "Offshore Medic Deployment",
    description: "Certified offshore medics ready for rotational deployment to rigs, platforms, and marine vessels worldwide.",
    color: "from-cyan-500 to-teal-600",
  },
  {
    icon: Building2,
    title: "Clinic Setup & Operations",
    description: "End-to-end clinic design, equipping, staffing, and operational management for industrial facilities.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: Monitor,
    title: "Telemedicine Solutions",
    description: "Remote consultation platforms connecting offshore and remote workers with specialist physicians 24/7.",
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: Activity,
    title: "Remote Patient Monitoring",
    description: "Real-time health data monitoring systems for proactive care and early intervention in remote locations.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Medical Support",
    description: "Rapid response medical teams and emergency protocols for critical industrial incidents.",
    color: "from-red-500 to-rose-600",
  },
  {
    icon: HeartPulse,
    title: "Occupational Health Programs",
    description: "Comprehensive wellness, fitness-to-work assessments, drug testing, and workplace health management.",
    color: "from-purple-500 to-indigo-600",
  },
  {
    icon: Wrench,
    title: "Medical Equipment Support",
    description: "Procurement, installation, calibration, and maintenance of medical and emergency equipment.",
    color: "from-amber-500 to-orange-600",
  },
];

export default function ServicesOverview() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Our Services"
          title="Comprehensive Healthcare Solutions for Industrial Operations"
          description="From medical personnel outsourcing to cutting-edge telemedicine, we deliver end-to-end healthcare solutions that keep your workforce safe and your operations compliant."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link to="/services" className="group block h-full">
                <div className="relative h-full bg-card rounded-2xl border border-border p-6 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                  {/* Gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {service.description}
                  </p>

                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all">
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}