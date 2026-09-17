import React from "react";
import { motion } from "framer-motion";
import SectionHeading from "../shared/SectionHeading";
import { 
  TrendingDown, Zap, ShieldCheck, GraduationCap, 
  Clock, DollarSign
} from "lucide-react";

const reasons = [
  {
    icon: TrendingDown,
    title: "Reduced Downtime",
    description: "Proactive healthcare management that minimizes lost work hours and keeps your operations running efficiently.",
    stat: "40%",
    statLabel: "reduction in health-related downtime",
  },
  {
    icon: Zap,
    title: "Faster Emergency Response",
    description: "Pre-positioned medical teams and equipment ensure rapid response to any industrial medical emergency.",
    stat: "<2hr",
    statLabel: "average emergency response time",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Assurance",
    description: "Full regulatory compliance with local and international occupational health standards and certifications.",
    stat: "100%",
    statLabel: "compliance rate maintained",
  },
  {
    icon: GraduationCap,
    title: "Skilled Personnel",
    description: "Rigorously vetted, certified, and continuously trained medical professionals for every deployment.",
    stat: "500+",
    statLabel: "certified medical professionals",
  },
  {
    icon: Clock,
    title: "24/7 Continuity",
    description: "Round-the-clock medical coverage with seamless shift transitions and zero gaps in care delivery.",
    stat: "24/7",
    statLabel: "uninterrupted medical coverage",
  },
  {
    icon: DollarSign,
    title: "Cost Efficiency",
    description: "Optimized healthcare operations that deliver premium quality at predictable, competitive pricing.",
    stat: "30%",
    statLabel: "cost savings vs in-house",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Why TRUV Medical"
          title="Built for Operational Excellence"
          description="We don't just provide medical services—we engineer healthcare operations that integrate seamlessly with your industrial workflows."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="bg-card rounded-2xl border border-border p-8 h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <reason.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-heading font-bold text-primary">{reason.stat}</div>
                    <div className="text-[11px] text-muted-foreground max-w-[120px]">{reason.statLabel}</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                  {reason.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}