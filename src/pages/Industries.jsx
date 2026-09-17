import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Fuel, Anchor, Factory, Building2, HardHat, Ship, ArrowRight, CheckCircle } from "lucide-react";

const industries = [
  {
    icon: Fuel,
    name: "Oil & Gas",
    tagline: "Upstream, Downstream & Midstream Operations",
    description: "Comprehensive occupational healthcare for the entire oil & gas value chain. From exploration sites to refineries, our medical teams ensure workforce safety and regulatory compliance.",
    capabilities: ["On-site medical facilities", "Fitness-for-duty programs", "Emergency response planning", "Hazardous material health monitoring", "Regulatory compliance management"],
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Anchor,
    name: "Offshore Operations",
    tagline: "Rigs, Platforms & Subsea Installations",
    description: "Specialized offshore medical services with certified medics trained for marine environments. We maintain 24/7 medical coverage on platforms and drilling rigs.",
    capabilities: ["BOSIET/HUET certified medics", "Remote telemedicine connectivity", "Emergency evacuation protocols", "Offshore fitness assessments", "Marine medical supplies"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Factory,
    name: "Manufacturing",
    tagline: "Industrial Plants & Processing Facilities",
    description: "Workplace health programs tailored for manufacturing environments, addressing occupational hazards, ergonomic risks, and employee wellness.",
    capabilities: ["Occupational hazard assessment", "On-site clinic management", "Industrial hygiene monitoring", "Employee wellness programs", "Injury prevention"],
    color: "from-slate-500 to-slate-700",
  },
  {
    icon: Building2,
    name: "Corporate Organizations",
    tagline: "Headquarters & Office Environments",
    description: "Corporate wellness and occupational health services that enhance employee productivity, reduce absenteeism, and demonstrate duty of care.",
    capabilities: ["Executive health assessments", "Corporate wellness programs", "Mental health support", "Ergonomic evaluations", "Health risk assessments"],
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: HardHat,
    name: "Construction",
    tagline: "Major Infrastructure Projects",
    description: "Mobile and fixed-site medical services for construction projects of all scales. Rapid deployment capabilities for project mobilization.",
    capabilities: ["Mobile medical units", "Site emergency response", "Construction health surveillance", "Heat stress management", "First aid training"],
    color: "from-yellow-500 to-amber-600",
  },
  {
    icon: Ship,
    name: "Maritime Operations",
    tagline: "Vessels, Ports & Marine Infrastructure",
    description: "Maritime medical services compliant with international maritime health standards. Support for vessels, port operations, and coastal facilities.",
    capabilities: ["Ship medical officer deployment", "Port health services", "Maritime medical supplies", "PEME examinations", "Maritime health compliance"],
    color: "from-cyan-600 to-blue-700",
  },
];

export default function Industries() {
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
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">Industries</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight max-w-3xl">
              Specialized Healthcare Across High-Risk Sectors
            </h1>
            <p className="text-lg text-white/70 mt-6 max-w-2xl">
              Deep domain expertise across oil & gas, offshore, manufacturing, and corporate sectors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Industries Detail */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <div className="grid lg:grid-cols-5">
                {/* Icon Side */}
                <div className={`lg:col-span-2 bg-gradient-to-br ${ind.color} p-12 flex flex-col justify-center`}>
                  <ind.icon className="w-16 h-16 text-white/90 mb-6" />
                  <h2 className="text-3xl font-heading font-bold text-white mb-2">{ind.name}</h2>
                  <p className="text-white/80 text-sm">{ind.tagline}</p>
                </div>
                {/* Content Side */}
                <div className="lg:col-span-3 p-8 lg:p-12">
                  <p className="text-muted-foreground leading-relaxed mb-6">{ind.description}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {ind.capabilities.map((cap) => (
                      <div key={cap} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                        <span className="text-sm">{cap}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-8" variant="outline" asChild>
                    <Link to="/contact">Get a Custom Solution <ArrowRight className="w-4 h-4 ml-2" /></Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}