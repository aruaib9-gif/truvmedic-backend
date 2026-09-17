import React from "react";
import { motion } from "framer-motion";
import SectionHeading from "../components/shared/SectionHeading";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Target, Eye, Heart, Shield, Users, Lightbulb, 
  Star, Award, ArrowRight 
} from "lucide-react";

import { useSiteConfig } from "@/hooks/useSiteConfig";
const DEFAULT_ABOUT_IMAGE = "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=900&q=80";

const values = [
  { icon: Heart, name: "Dedication", desc: "Unwavering commitment to excellence in every deployment" },
  { icon: Shield, name: "Integrity", desc: "Transparent, ethical operations at every level" },
  { icon: Users, name: "Teamwork", desc: "Collaborative partnerships with clients and personnel" },
  { icon: Lightbulb, name: "Innovation", desc: "Embracing technology to advance healthcare delivery" },
  { icon: Star, name: "Reliability", desc: "Consistent, dependable service without compromise" },
  { icon: Award, name: "Value-Driven", desc: "Solutions that deliver measurable ROI and outcomes" },
];

const milestones = [
  { year: "2010", event: "Company founded with a vision for industrial healthcare excellence" },
  { year: "2013", event: "First major offshore deployment contract secured" },
  { year: "2016", event: "Expanded to full clinic operations management" },
  { year: "2019", event: "Launched telemedicine and remote monitoring platform" },
  { year: "2022", event: "500+ medical professionals deployed across Nigeria" },
  { year: "2024", event: "Truv BPConnect digital health platform launched" },
];

export default function About() {
  const { config } = useSiteConfig();
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
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
              About TRUV Medical
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight max-w-3xl">
              Engineering Healthcare Excellence for Industry
            </h1>
            <p className="text-lg text-white/70 mt-6 max-w-2xl leading-relaxed">
              Since our founding, TRUV Medical Services has been at the forefront of occupational healthcare, providing world-class medical solutions to the most demanding industrial environments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img src={config.about_image_url || DEFAULT_ABOUT_IMAGE} alt="TRUV Medical team" className="rounded-2xl shadow-2xl w-full" />
            </motion.div>
            <div className="space-y-10">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To provide professional medical personnel outsourcing, clinic setup, and end-to-end clinic operations management services for oil & gas, manufacturing, and corporate organizations, ensuring the highest standards of occupational healthcare, safety compliance, and workforce well-being.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold">Our Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To be the leading provider of integrated occupational healthcare and clinic management solutions, recognized for innovation, reliability, and commitment to transforming workplace health management across Africa and beyond.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading badge="Our Values" title="What Drives Everything We Do" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {values.map((v, i) => (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{v.name}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading badge="Our Journey" title="A Legacy of Healthcare Excellence" />
          <div className="mt-16 space-y-0">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-6 relative"
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {m.year}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 h-16 bg-border" />}
                </div>
                <div className="pb-8 pt-2">
                  <p className="text-foreground font-medium">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Partner With TRUV Medical</h2>
          <p className="text-white/70 mb-8">Let's discuss how we can support your healthcare operations.</p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/contact">Get in Touch <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}