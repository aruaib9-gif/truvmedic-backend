import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, MessageSquare, Plus, Loader2, Inbox, Search, X, ChevronRight, Reply } from "lucide-react";
import { format } from "date-fns";

const PRIORITY_COLORS = {
  normal: "bg-gray-100 text-gray-600",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function InternalMessaging() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [view, setView] = useState("inbox"); // inbox | sent | compose
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ to_user_id: "", subject: "", body: "", priority: "normal" });
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    if (!user) return;
    const [allMsgs, allUsers] = await Promise.all([
      api.entities.InternalMessage.list("-created_date", 200),
      api.users.staff(),
    ]);
    setInbox(allMsgs.filter(m => m.to_user_id === user.id));
    setSent(allMsgs.filter(m => m.from_user_id === user.id));
    setUsers(allUsers.filter(u => u.id !== user?.id));
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, [user?.id]);

  useEffect(() => {
    if (selectedMsg && !selectedMsg.read && selectedMsg.to_user_id === user?.id) {
      api.entities.InternalMessage.update(selectedMsg.id, { read: true }).then(() => {
        setInbox(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, read: true } : m));
      });
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMsg?.id]);

  const handleSend = async () => {
    if (!form.to_user_id || !form.body.trim()) {
      toast.error("Please select a recipient and write a message.");
      return;
    }
    setSending(true);
    const recipient = users.find(u => u.id === form.to_user_id);
    const threadId = form.thread_id || `${user.id}_${Date.now()}`;
    await api.entities.InternalMessage.create({
      from_user_id: user.id,
      from_user_name: user.full_name || user.email,
      from_user_email: user.email,
      to_user_id: form.to_user_id,
      to_user_name: recipient?.full_name || recipient?.email || "",
      to_user_email: recipient?.email || "",
      subject: form.subject || "(No subject)",
      body: form.body.trim(),
      priority: form.priority,
      read: false,
      thread_id: threadId,
    });
    toast.success("Message sent!");
    setForm({ to_user_id: "", subject: "", body: "", priority: "normal" });
    setView("sent");
    setSending(false);
    fetchMessages();
  };

  const handleReply = (msg) => {
    setForm({
      to_user_id: msg.from_user_id,
      subject: msg.subject?.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`,
      body: "",
      priority: "normal",
      thread_id: msg.thread_id || msg.id,
    });
    setView("compose");
  };

  const currentList = view === "inbox" ? inbox : sent;
  const unreadCount = inbox.filter(m => !m.read).length;

  const filteredList = currentList.filter(m => {
    const q = search.toLowerCase();
    return !q || [m.subject, m.from_user_name, m.to_user_name, m.body].some(f => f?.toLowerCase().includes(q));
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Internal Messaging</h1>
          <p className="text-muted-foreground text-sm">Send messages to staff team members</p>
        </div>
        <Button className="gap-2" onClick={() => { setSelectedMsg(null); setView("compose"); }}>
          <Plus className="w-4 h-4" /> New Message
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 min-h-[600px]">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3 space-y-1">
          <button
            onClick={() => { setView("inbox"); setSelectedMsg(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === "inbox" ? "bg-primary text-white" : "hover:bg-muted"}`}
          >
            <span className="flex items-center gap-2"><Inbox className="w-4 h-4" />Inbox</span>
            {unreadCount > 0 && (
              <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${view === "inbox" ? "bg-white/20 text-white" : "bg-primary text-white"}`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setView("sent"); setSelectedMsg(null); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === "sent" ? "bg-primary text-white" : "hover:bg-muted"}`}
          >
            <Send className="w-4 h-4" />Sent
          </button>
          <button
            onClick={() => { setView("compose"); setSelectedMsg(null); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === "compose" ? "bg-primary text-white" : "hover:bg-muted"}`}
          >
            <Plus className="w-4 h-4" />Compose
          </button>
        </div>

        {/* Main Panel */}
        <div className="col-span-12 md:col-span-9 bg-card rounded-xl border flex flex-col overflow-hidden">
          {view === "compose" ? (
            <div className="p-6 space-y-4 flex-1">
              <h3 className="font-semibold text-base">New Message</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1">To <span className="text-red-500">*</span></label>
                  <Select value={form.to_user_id} onValueChange={v => setForm(f => ({ ...f, to_user_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select recipient..." /></SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.full_name || u.email} ({u.role || "user"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Priority</label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Subject</label>
                <Input placeholder="Message subject..." value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Message <span className="text-red-500">*</span></label>
                <Textarea rows={8} placeholder="Write your message..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setView("inbox")}>Cancel</Button>
                <Button onClick={handleSend} disabled={sending} className="gap-2">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Message
                </Button>
              </div>
            </div>
          ) : selectedMsg ? (
            <div className="p-6 flex-1 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-base">{selectedMsg.subject || "(No subject)"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {view === "inbox" ? `From: ${selectedMsg.from_user_name || selectedMsg.from_user_email}` : `To: ${selectedMsg.to_user_name || selectedMsg.to_user_email}`}
                    {" · "}
                    {selectedMsg.created_date ? format(new Date(selectedMsg.created_date), "MMM d, yyyy HH:mm") : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={PRIORITY_COLORS[selectedMsg.priority] || PRIORITY_COLORS.normal}>
                    {selectedMsg.priority}
                  </Badge>
                  {view === "inbox" && (
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => handleReply(selectedMsg)}>
                      <Reply className="w-3 h-3" />Reply
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => setSelectedMsg(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <hr />
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMsg.body}</p>
              <div ref={bottomRef} />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm capitalize">{view} ({filteredList.length})</h3>
                  <div className="relative w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input className="pl-8 h-8 text-xs" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y">
                {filteredList.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No messages yet.</p>
                  </div>
                )}
                {filteredList.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMsg(msg)}
                    className={`w-full text-left px-4 py-3.5 hover:bg-muted/50 transition-colors flex items-start gap-3 ${!msg.read && view === "inbox" ? "bg-primary/5 font-medium" : ""}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!msg.read && view === "inbox" ? "bg-primary" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm truncate">
                          {view === "inbox" ? (msg.from_user_name || msg.from_user_email || "Unknown") : (msg.to_user_name || msg.to_user_email || "Unknown")}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {msg.created_date ? format(new Date(msg.created_date), "MMM d") : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">{msg.subject || "(No subject)"}</span>
                        {msg.priority !== "normal" && (
                          <Badge className={`${PRIORITY_COLORS[msg.priority]} text-xs px-1.5 py-0 shrink-0`}>{msg.priority}</Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}