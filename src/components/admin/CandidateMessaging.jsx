import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send, MessageSquare, Mail, ChevronUp, Plus, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useAuth } from "@/lib/AuthContext";
import { format } from "date-fns";

const TYPE_OPTIONS = [
  { value: "general", label: "General Message" },
  { value: "follow_up", label: "Follow-up" },
  { value: "request_docs", label: "Request Documents" },
  { value: "offer", label: "Job Offer" },
  { value: "rejection", label: "Rejection Notice" },
];

const TYPE_COLORS = {
  general: "bg-blue-100 text-blue-700",
  interview_invite: "bg-orange-100 text-orange-700",
  offer: "bg-green-100 text-green-700",
  rejection: "bg-red-100 text-red-700",
  request_docs: "bg-yellow-100 text-yellow-700",
  follow_up: "bg-purple-100 text-purple-700",
};

const MESSAGE_TEMPLATES = {
  general: "",
  follow_up: "We wanted to follow up on your application for {job_title}. Please let us know if you have any questions or updates to share.",
  request_docs: "Thank you for your application for {job_title}. To proceed with your application, we kindly request the following additional documents:\n\n• [Document 1]\n• [Document 2]\n\nPlease send these at your earliest convenience.",
  offer: "We are pleased to extend a formal job offer for the position of {job_title} at TRUV Medical Services Limited. Please contact us to discuss the details and next steps.",
  rejection: "Thank you for your interest in the {job_title} position at TRUV Medical Services Limited. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. We appreciate the time and effort you invested and wish you the best in your future endeavors.",
};

export default function CandidateMessaging({ application }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ subject: "", body: "", message_type: "general" });
  const bottomRef = useRef(null);
  const { config } = useSiteConfig();
  const { user } = useAuth();

  const fetchMessages = async () => {
    const data = await api.entities.CandidateMessage.filter({ application_id: application.id }, "-created_date", 100);
    setMessages(data.reverse());
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [application.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const applyTemplate = (type) => {
    const template = (MESSAGE_TEMPLATES[type] || "")
      .replace("{job_title}", application.job_title || "the position");
    setForm(f => ({ ...f, message_type: type, body: template }));
  };

  const handleSend = async () => {
    if (!form.body.trim()) { toast.error("Message body is required."); return; }
    setSending(true);
    try {
      await api.functions.invoke("sendCandidateMessage", {
        application_id: application.id,
        candidate_email: application.email,
        candidate_name: application.full_name,
        job_title: application.job_title,
        subject: form.subject || `Update on your application — ${application.job_title}`,
        message_body: form.body,
        message_type: form.message_type,
        admin_email: config.email || undefined,
      });
      toast.success("Message sent & email delivered to candidate");
      setForm({ subject: "", body: "", message_type: "general" });
      setShowCompose(false);
      await fetchMessages();
    } catch (err) {
      toast.error("Failed to send: " + (err?.message || ""));
    }
    setSending(false);
  };

  const logInbound = async () => {
    const note = window.prompt("Log a reply/note from the candidate:");
    if (!note?.trim()) return;
    await api.entities.CandidateMessage.create({
      application_id: application.id,
      candidate_email: application.email,
      candidate_name: application.full_name,
      job_title: application.job_title,
      direction: "inbound",
      subject: "Candidate reply (manual log)",
      body: note.trim(),
      sent_by: user?.email || "admin",
      email_sent: false,
      message_type: "general",
    });
    toast.success("Reply logged");
    fetchMessages();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Communication Log</span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{messages.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={logInbound}>
            <ArrowDownLeft className="w-3 h-3" />Log Reply
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setShowCompose(c => !c)}>
            {showCompose ? <ChevronUp className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showCompose ? "Close" : "New Message"}
          </Button>
        </div>
      </div>

      {/* Compose Panel */}
      {showCompose && (
        <div className="bg-muted/30 border border-border rounded-xl p-4 mb-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1">Message Type</label>
              <Select value={form.message_type} onValueChange={v => applyTemplate(v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Subject (optional)</label>
              <Input
                className="h-8 text-xs"
                placeholder={`Update on your application — ${application.job_title}`}
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Message <span className="text-red-500">*</span></label>
            <Textarea
              rows={5}
              className="text-sm"
              placeholder="Type your message to the candidate..."
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              Sending to: <span className="font-medium text-foreground">{application.email}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowCompose(false)}>Cancel</Button>
              <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleSend} disabled={sending}>
                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Send & Email
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 max-h-96 pr-1">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No messages yet. Start a conversation with this candidate.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`rounded-xl p-3 border ${msg.direction === "inbound" ? "bg-blue-50/50 border-blue-100 ml-4" : "bg-card border-border"}`}>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {msg.direction === "outbound"
                  ? <ArrowUpRight className="w-3.5 h-3.5 text-primary shrink-0" />
                  : <ArrowDownLeft className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                }
                <span className="text-xs font-semibold truncate">{msg.subject || "No subject"}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLORS[msg.message_type] || TYPE_COLORS.general}`}>
                  {msg.message_type?.replace(/_/g, " ")}
                </span>
                {msg.email_sent && <Mail className="w-3 h-3 text-green-500" title="Email sent" />}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {msg.created_date ? format(new Date(msg.created_date), "MMM d, HH:mm") : ""}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{msg.body}</p>
            {msg.sent_by && (
              <div className="text-xs text-muted-foreground mt-1.5">
                {msg.direction === "outbound" ? `Sent by: ${msg.sent_by}` : `Logged by: ${msg.sent_by}`}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}