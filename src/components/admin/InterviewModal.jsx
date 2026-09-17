import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/api/client";
import { toast } from "sonner";
import { Loader2, Mail, Video, MapPin, Calendar, Clock, User, Plus, Trash2 } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export default function InterviewModal({ application, open, onClose, onSent }) {
  const { config } = useSiteConfig();
  const [form, setForm] = useState({
    interview_date: "",
    interview_time: "",
    interview_type: "virtual",
    meet_link: "",
    location: "",
    additional_notes: "",
  });
  const [interviewers, setInterviewers] = useState([{ name: "", email: "" }]);
  const [sending, setSending] = useState(false);

  if (!application) return null;

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const updateInterviewer = (idx, field, value) => {
    setInterviewers(prev => prev.map((iv, i) => i === idx ? { ...iv, [field]: value } : iv));
  };

  const addInterviewer = () => setInterviewers(prev => [...prev, { name: "", email: "" }]);

  const removeInterviewer = (idx) => {
    if (interviewers.length === 1) return;
    setInterviewers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    if (!form.interview_date || !form.interview_time) {
      toast.error("Please set interview date and time.");
      return;
    }
    setSending(true);
    try {
      const res = await api.functions.invoke("sendInterviewInvite", {
        applicant_name: application.full_name,
        applicant_email: application.email,
        job_title: application.job_title,
        interview_date: form.interview_date,
        interview_time: form.interview_time,
        interview_type: form.interview_type,
        meet_link: form.meet_link,
        location: form.location,
        interviewers: interviewers.filter(iv => iv.name || iv.email),
        additional_notes: form.additional_notes,
        application_id: application.id,
        admin_email: config.email || undefined,
      });

      if (res.data?.warnings?.length) {
        toast.success("Interview scheduled! Note: some notification emails could not be delivered to external addresses.");
      } else {
        toast.success(`Interview invitation sent to ${application.email}`);
      }
      if (onSent) onSent();
      onClose();
    } catch (err) {
      toast.error("Failed to send invitation: " + (err?.message || "Unknown error"));
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!sending) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Mail className="w-5 h-5 text-primary" />
            Send Interview Invitation
          </DialogTitle>
        </DialogHeader>

        {/* Applicant Info */}
        <div className="bg-muted/40 rounded-lg p-3 text-sm mb-2">
          <div className="font-semibold">{application.full_name}</div>
          <div className="text-muted-foreground">{application.email}</div>
          <div className="text-primary text-xs mt-0.5">{application.job_title}</div>
        </div>

        <div className="space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Interview Date *
              </label>
              <Input type="date" value={form.interview_date} onChange={e => update("interview_date", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Interview Time *
              </label>
              <Input type="time" value={form.interview_time} onChange={e => update("interview_time", e.target.value)} />
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="text-xs font-medium block mb-1">Interview Type</label>
            <Select value={form.interview_type} onValueChange={v => update("interview_type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">🖥 Virtual / Online</SelectItem>
                <SelectItem value="in_person">🏢 In Person</SelectItem>
                <SelectItem value="phone">📞 Phone Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meet Link or Location */}
          {form.interview_type === "virtual" ? (
            <div>
              <label className="text-xs font-medium block mb-1 flex items-center gap-1">
                <Video className="w-3.5 h-3.5" /> Google Meet / Zoom Link
              </label>
              <Input
                placeholder="https://meet.google.com/abc-defg-hij"
                value={form.meet_link}
                onChange={e => update("meet_link", e.target.value)}
              />
            </div>
          ) : form.interview_type === "in_person" ? (
            <div>
              <label className="text-xs font-medium block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Location / Address
              </label>
              <Input
                placeholder="e.g. TRUV Medical Office, Lagos"
                value={form.location}
                onChange={e => update("location", e.target.value)}
              />
            </div>
          ) : null}

          {/* Interviewers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Interviewer(s)
              </label>
              <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addInterviewer}>
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {interviewers.map((iv, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <Input
                    placeholder="Name"
                    value={iv.name}
                    onChange={e => updateInterviewer(idx, "name", e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Email (optional)"
                    value={iv.email}
                    onChange={e => updateInterviewer(idx, "email", e.target.value)}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => removeInterviewer(idx)}
                    disabled={interviewers.length === 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium block mb-1">Additional Notes (optional)</label>
            <Textarea
              placeholder="Any additional instructions for the candidate..."
              rows={3}
              value={form.additional_notes}
              onChange={e => update("additional_notes", e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={sending}>Cancel</Button>
            <Button className="flex-1 gap-2" onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Send Invitation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}