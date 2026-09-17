import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, HeartPulse, Stethoscope, Monitor } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&q=80";

const stats = [
  { value: "500+", label: "Medical Professionals", icon: Stethoscope },
  { value: "24/7", label: "Emergency Coverage", icon: Clock },
  { value: "100%", label: "Compliance Rate", icon: Shield },
  { value: "15+", label: "Years Experience", icon: HeartPulse },
];

export default function HeroSection() {
  const { config } = useSiteConfig();
  const heroImage = config.hero_image_url || DEFAULT_HERO_IMAGE;
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Offshore medical operations" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/80 to-[#0A1628]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/60 to-transparent" />
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,188,212,0.3) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm font-medium mb-6">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Trusted by Leading Oil & Gas Companies
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-6">
              {config.hero_title || "Integrated Occupational Healthcare & Medical Workforce Solutions"}
            </h1>

            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-lg">
              {config.hero_subtitle || "24/7 medical readiness, offshore & industrial healthcare, full regulatory compliance, and technology-driven operations for enterprises that never stop."}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/25 text-base px-8" asChild>
                <Link to="/contact">
                  Request Consultation <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8" asChild>
                <Link to="/services">Explore Services</Link>
              </Button>
              {config.telemedicine_portal_url && (
                <Button size="lg" variant="outline" className="border-accent/50 text-accent hover:bg-accent/10 text-base px-8" asChild>
                  <a href={config.telemedicine_portal_url} target="_blank" rel="noopener noreferrer">
                    <Monitor className="w-4 h-4 mr-2" /> Telemedicine Portal
                  </a>
                </Button>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                ISO Certified
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                OSHA Compliant
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                GDPR Ready
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.15 }}
                className="glass rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group"
              >
                <stat.icon className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-heading font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full">
          <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 33.3C840 36.7 960 43.3 1080 45C1200 46.7 1320 43.3 1380 41.7L1440 40V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="hsl(210, 20%, 98%)" />
        </svg>
      </div>
    </section>
  );
}