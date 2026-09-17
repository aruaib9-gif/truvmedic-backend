import React from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Users, MapPin, Award, CheckCircle } from "lucide-react";

const metrics = [
  { icon: Users, value: "500+", label: "Medical Professionals Deployed", color: "text-blue-500" },
  { icon: Clock, value: "<2hrs", label: "Average Emergency Response", color: "text-cyan-500" },
  { icon: MapPin, value: "50+", label: "Active Deployment Sites", color: "text-teal-500" },
  { icon: Shield, value: "100%", label: "Regulatory Compliance", color: "text-green-500" },
  { icon: Award, value: "15+", label: "Years of Excellence", color: "text-indigo-500" },
  { icon: CheckCircle, value: "99.9%", label: "Operational Uptime", color: "text-emerald-500" },
];

export default function TrustIndicators() {
  return (
    <section className="py-16 bg-gradient-to-b from-[#0A1628] to-[#0E1F38] relative overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <metric.icon className={`w-8 h-8 ${metric.color} mx-auto mb-3`} />
              <div className="text-2xl lg:text-3xl font-heading font-bold text-white">{metric.value}</div>
              <div className="text-xs text-white/50 mt-1">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}