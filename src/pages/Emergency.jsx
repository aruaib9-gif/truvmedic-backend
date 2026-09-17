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
  AlertTriangle, Phone, Clock, Shield, 
  CheckCircle, Siren, HeartPulse, Zap 
} from "lucide-react";

export default function Emergency() {
  const { config } = useSiteConfig();
  const [form, setForm] = useState({
    contact_name: "", company: "", phone: "", email: "",
    location: "", emergency_type: "", description: "", urgency: "high"
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await api.entities.EmergencyRequest.create(form);
    toast.success("Emergency request submitted! Our team is being alerted now.");
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div>
      {/* Urgent Hero */}
      <section className="relative py-16 bg-gradient-to-br from-red-900 via-red-800 to-red-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6">
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
              24/7 Emergency Medical Support
            </div>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
              Emergency Support
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              For immediate medical emergencies, call our emergency hotline directly. For deployment requests and non-life-threatening emergencies, use the form below.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={`tel:${config.emergency_phone || "+2348000000000"}`} className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-red-800 font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
                <Phone className="w-6 h-6 animate-pulse" />
                {config.emergency_phone || "+234 800 000 0000"}
              </a>
              <span className="text-white/60 text-sm">Available 24 hours, 7 days a week</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Response Metrics */}
      <section className="py-8 bg-red-50 border-b border-red-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Zap, value: "<2 hours", label: "Response Time" },
              { icon: Clock, value: "24/7", label: "Availability" },
              { icon: HeartPulse, value: "100+", label: "Emergency Medics" },
              { icon: Shield, value: "99.9%", label: "Deployment Success" },
            ].map((stat) => (
              <div key={stat.label}>
                <stat.icon className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-xl font-heading font-bold text-red-800">{stat.value}</div>
                <div className="text-xs text-red-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Form */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-heading font-bold mb-4">Request Received</h2>
              <p className="text-muted-foreground text-lg mb-2">Our emergency response team has been alerted.</p>
              <p className="text-muted-foreground">A coordinator will contact you within 30 minutes.</p>
              <Button className="mt-8" onClick={() => { setSubmitted(false); setForm({ contact_name: "", company: "", phone: "", email: "", location: "", emergency_type: "", description: "", urgency: "high" }); }}>
                Submit Another Request
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-10">
                <Siren className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-heading font-bold mb-2">Emergency Deployment Request</h2>
                <p className="text-muted-foreground">
                  For non-life-threatening emergencies or rapid deployment requests.
                  <br />For life-threatening emergencies, call the hotline immediately.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-card rounded-2xl border-2 border-red-200 p-8 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input placeholder="Contact Name *" required value={form.contact_name} onChange={(e) => handleChange("contact_name", e.target.value)} />
                  <Input placeholder="Phone Number *" required value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                  <Input placeholder="Company" value={form.company} onChange={(e) => handleChange("company", e.target.value)} />
                  <Input placeholder="Email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                  <Input placeholder="Location / Site" className="sm:col-span-2" value={form.location} onChange={(e) => handleChange("location", e.target.value)} />
                </div>
                <Select onValueChange={(v) => handleChange("emergency_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Emergency Type *" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical_emergency">Medical Emergency</SelectItem>
                    <SelectItem value="rapid_deployment">Rapid Deployment Request</SelectItem>
                    <SelectItem value="evacuation_support">Evacuation Support</SelectItem>
                    <SelectItem value="equipment_failure">Equipment Failure</SelectItem>
                    <SelectItem value="personnel_replacement">Personnel Replacement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(v) => handleChange("urgency", v)} defaultValue="high">
                  <SelectTrigger><SelectValue placeholder="Urgency Level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical - Immediate Response</SelectItem>
                    <SelectItem value="high">High - Within 2 Hours</SelectItem>
                    <SelectItem value="medium">Medium - Within 24 Hours</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Describe the situation..." rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" size="lg" disabled={submitting}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit Emergency Request"}
                </Button>
              </form>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}