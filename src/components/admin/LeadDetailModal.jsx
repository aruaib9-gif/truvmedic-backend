import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function LeadDetailModal({ lead, onSave, onClose }) {
  const [form, setForm] = useState({
    full_name: lead?.full_name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
    industry: lead?.industry || "",
    country: lead?.country || "",
    service_interest: lead?.service_interest || "",
    employee_count: lead?.employee_count || "",
    message: lead?.message || "",
    status: lead?.status || "new",
    priority: lead?.priority || "medium",
    source: lead?.source || "website",
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg font-heading font-bold">{lead ? "Edit Lead" : "New Lead"}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Full Name *</label>
              <Input value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Email *</label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="Email" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Phone</label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="Phone" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Company</label>
              <Input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Company" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Industry</label>
              <Select value={form.industry} onValueChange={v => set("industry", v)}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {["oil_gas","manufacturing","offshore","corporate","construction","maritime","industrial","other"].map(v => (
                    <SelectItem key={v} value={v}>{v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Country</label>
              <Input value={form.country} onChange={e => set("country", e.target.value)} placeholder="Country" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Service Interest</label>
              <Select value={form.service_interest} onValueChange={v => set("service_interest", v)}>
                <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
                <SelectContent>
                  {["medical_outsourcing","offshore_medics","clinic_setup","telemedicine","remote_monitoring","emergency_support","occupational_health","equipment_support","general_inquiry"].map(v => (
                    <SelectItem key={v} value={v}>{v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Employee Count</label>
              <Input value={form.employee_count} onChange={e => set("employee_count", e.target.value)} placeholder="e.g. 50-200" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Status</label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["new","contacted","qualified","proposal","won","lost"].map(v => (
                    <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Priority</label>
              <Select value={form.priority} onValueChange={v => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["low","medium","high","urgent"].map(v => (
                    <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Message / Notes</label>
            <Textarea value={form.message} onChange={e => set("message", e.target.value)} rows={4} placeholder="Notes, messages, requirements..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave(form)}>Save Lead</Button>
        </div>
      </div>
    </div>
  );
}