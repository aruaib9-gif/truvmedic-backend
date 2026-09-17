import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/api/client";
import { toast } from "sonner";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function CTASection() {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", company: "", 
    industry: "", service_interest: "", message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await api.entities.Lead.create({ ...form, source: "consultation" });
    toast.success("Request submitted! Our team will contact you within 24 hours.");
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <section className="py-24 bg-gradient-to-br from-primary via-[#1B3A5C] to-[#0A1628] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
              Get Started Today
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight mb-6">
              Ready to Elevate Your Workplace Healthcare?
            </h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              Let us design a comprehensive healthcare solution tailored to your operations. From offshore medics to full clinic management, we deliver excellence.
            </p>
            <div className="space-y-4">
              {[
                "Custom healthcare plans for your industry",
                "Rapid deployment of certified medical personnel",
                "Full regulatory compliance guaranteed",
                "Technology-integrated healthcare operations",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-white/80">
                  <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {submitted ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-heading font-bold mb-2">Thank You!</h3>
                <p className="text-muted-foreground">We'll be in touch within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl">
                <h3 className="text-xl font-heading font-bold mb-6">Request a Consultation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Full Name *" required value={form.full_name} onChange={(e) => handleChange("full_name", e.target.value)} />
                  <Input placeholder="Email *" type="email" required value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                  <Input placeholder="Phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                  <Input placeholder="Company" value={form.company} onChange={(e) => handleChange("company", e.target.value)} />
                  <Select onValueChange={(v) => handleChange("industry", v)}>
                    <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oil_gas">Oil & Gas</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="offshore">Offshore</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="maritime">Maritime</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(v) => handleChange("service_interest", v)}>
                    <SelectTrigger><SelectValue placeholder="Service Needed" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical_outsourcing">Medical Outsourcing</SelectItem>
                      <SelectItem value="offshore_medics">Offshore Medics</SelectItem>
                      <SelectItem value="clinic_setup">Clinic Setup</SelectItem>
                      <SelectItem value="telemedicine">Telemedicine</SelectItem>
                      <SelectItem value="emergency_support">Emergency Support</SelectItem>
                      <SelectItem value="occupational_health">Occupational Health</SelectItem>
                      <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Tell us about your requirements..." className="mt-4" value={form.message} onChange={(e) => handleChange("message", e.target.value)} />
                <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90" size="lg" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Your data is protected. We respect your privacy.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}