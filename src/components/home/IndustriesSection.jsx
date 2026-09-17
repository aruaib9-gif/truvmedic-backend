import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeading from "../shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { ArrowRight, Fuel, Anchor, Factory, Building2, HardHat, Ship } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const DEFAULT_OFFSHORE = "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80";
const DEFAULT_INDUSTRIAL = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80";

const industries = [
  { icon: Fuel, name: "Oil & Gas", desc: "Upstream, downstream, and midstream operations" },
  { icon: Anchor, name: "Offshore Operations", desc: "Rigs, platforms, and subsea installations" },
  { icon: Factory, name: "Manufacturing", desc: "Industrial plants and processing facilities" },
  { icon: Building2, name: "Corporate", desc: "Headquarters and corporate offices" },
  { icon: HardHat, name: "Construction", desc: "Major infrastructure and building projects" },
  { icon: Ship, name: "Maritime", desc: "Vessels, ports, and marine operations" },
];

export default function IndustriesSection() {
  const { config } = useSiteConfig();
  const offshoreImage = config.industries_offshore_image_url || DEFAULT_OFFSHORE;
  const industrialImage = config.industries_industrial_image_url || DEFAULT_INDUSTRIAL;
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <SectionHeading
              badge="Industries We Serve"
              title="Specialized Healthcare for High-Risk Industries"
              description="Our deep expertise across oil & gas, offshore, manufacturing, and corporate sectors ensures tailored healthcare solutions that meet the unique demands of each industry."
              align="left"
            />

            <div className="grid grid-cols-2 gap-4 mt-10">
              {industries.map((ind, i) => (
                <motion.div
                  key={ind.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl hover:bg-muted/80 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <ind.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-sm">{ind.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ind.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button className="mt-8" asChild>
              <Link to="/industries">
                View All Industries <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Right Image Stack */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <img src={offshoreImage} alt="Offshore operations" className="rounded-2xl shadow-2xl w-full" />
              <div className="absolute -bottom-8 -left-8 w-2/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img src={industrialImage} alt="Industrial healthcare" className="w-full h-48 object-cover" />
              </div>
              {/* Floating stat card */}
              <div className="absolute -top-4 -right-4 glass-card rounded-xl p-4 shadow-xl">
                <div className="text-2xl font-heading font-bold text-primary">50+</div>
                <div className="text-xs text-muted-foreground">Active Sites</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}