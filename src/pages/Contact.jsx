import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/api/client";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { 
  MapPin, Phone, Mail, Clock, CheckCircle, Send 
} from "lucide-react";

export default function Contact() {
  const { config } = useSiteConfig();
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", company: "",
    industry: "", service_interest: "", employee_count: "",
    country: "", message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await api.entities.Lead.create({ ...form, source: "contact_form" });
    toast.success("Message sent! We'll respond within 24 hours.");
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const contactInfo = [
    { icon: MapPin, title: "Head Office", detail: config.address || "Lagos, Nigeria", sub: "Available for in-person meetings" },
    { icon: Phone, title: "Phone", detail: config.phone || "+234 800 000 0000", sub: "24/7 emergency line available" },
    { icon: Mail, title: "Email", detail: config.email || "info@truvmedic.com", sub: "Response within 24 hours" },
    { icon: Clock, title: "Working Hours", detail: "Mon-Fri: 8AM - 6PM", sub: "24/7 emergency support" },
  ];

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">Contact Us</span>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white leading-tight max-w-3xl">
              Let's Build Your Healthcare Solution
            </h1>
            <p className="text-lg text-white/70 mt-6 max-w-2xl">
              Get in touch with our team. Whether you need a consultation, a quote, or immediate emergency support—we're here.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-2">Get In Touch</h2>
                <p className="text-muted-foreground">Our team is ready to discuss your healthcare requirements.</p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold">{info.title}</h4>
                      <p className="text-foreground">{info.detail}</p>
                      <p className="text-sm text-muted-foreground">{info.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h4 className="font-heading font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Emergency Support
                </h4>
                <p className="text-sm text-red-700 mb-3">
                  For medical emergencies requiring immediate response, contact our 24/7 emergency line.
                </p>
                <Button variant="destructive" size="sm" asChild>
                  <a href={`tel:${config.emergency_phone || "+2348000000000"}`}>Call Emergency Line</a>
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl border border-border p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-heading font-bold mb-2">Thank You!</h3>
                  <p className="text-muted-foreground">We've received your message. Our team will respond within 24 hours.</p>
                  <Button className="mt-6" onClick={() => { setSubmitted(false); setForm({ full_name: "", email: "", phone: "", company: "", industry: "", service_interest: "", employee_count: "", country: "", message: "" }); }}>
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 space-y-5">
                  <h3 className="text-xl font-heading font-bold mb-2">Send Us a Message</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder="Full Name *" required value={form.full_name} onChange={(e) => handleChange("full_name", e.target.value)} />
                    <Input placeholder="Email *" type="email" required value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                    <Input placeholder="Phone Number" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                    <Input placeholder="Company Name" value={form.company} onChange={(e) => handleChange("company", e.target.value)} />
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
                      <SelectTrigger><SelectValue placeholder="Service of Interest" /></SelectTrigger>
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
                    <Input placeholder="Number of Employees" value={form.employee_count} onChange={(e) => handleChange("employee_count", e.target.value)} />
                    <Input placeholder="Country" value={form.country} onChange={(e) => handleChange("country", e.target.value)} />
                  </div>
                  <Textarea placeholder="Describe your requirements..." rows={5} value={form.message} onChange={(e) => handleChange("message", e.target.value)} />
                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Your information is secure and will not be shared with third parties.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}