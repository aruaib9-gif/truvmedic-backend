import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, MessageCircle } from "lucide-react";
import { api } from "@/api/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const QUICK_REPLIES = [
  "What services do you offer?",
  "How do I request emergency support?",
  "Are you hiring?",
  "How can I contact you?",
];

function AnthonyAvatar({ size = "w-7 h-7" }) {
  return (
    <div className={`${size} rounded-full bg-primary flex items-center justify-center shrink-0 overflow-hidden`}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="20" cy="20" r="20" fill="#1a5fa8"/>
        {/* Body */}
        <ellipse cx="20" cy="33" rx="10" ry="7" fill="#1565C0"/>
        {/* Neck */}
        <rect x="17" y="26" width="6" height="5" rx="2" fill="#FFCC80"/>
        {/* Head */}
        <ellipse cx="20" cy="20" rx="8" ry="9" fill="#FFCC80"/>
        {/* Hair */}
        <ellipse cx="20" cy="13" rx="8" ry="4" fill="#4E342E"/>
        <rect x="12" y="13" width="16" height="4" rx="1" fill="#4E342E"/>
        {/* Eyes */}
        <ellipse cx="17" cy="20" rx="1.5" ry="1.8" fill="#3E2723"/>
        <ellipse cx="23" cy="20" rx="1.5" ry="1.8" fill="#3E2723"/>
        {/* Eye shine */}
        <circle cx="17.6" cy="19.3" r="0.5" fill="white"/>
        <circle cx="23.6" cy="19.3" r="0.5" fill="white"/>
        {/* Brows */}
        <path d="M15 17.5 Q17 16.5 19 17.5" stroke="#4E342E" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M21 17.5 Q23 16.5 25 17.5" stroke="#4E342E" strokeWidth="1" fill="none" strokeLinecap="round"/>
        {/* Smile */}
        <path d="M17 24 Q20 26.5 23 24" stroke="#E65100" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        {/* Shirt collar */}
        <path d="M14 32 L17 28 L20 30 L23 28 L26 32" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <AnthonyAvatar />
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function SiteChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! 👋 I'm Anthony, TRUV Medical's virtual assistant. How can I help you today? You can ask about our services, job openings, or how to reach our team." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { config } = useSiteConfig();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    const company = config.company_name || "TRUV Medical Services";
    const phone = config.phone || "+234 800 0000 000";
    const email = config.email || "info@truvmedic.com";
    const address = config.address || "Nigeria";

    const systemContext = `You are a helpful virtual assistant for ${company}, a leading occupational and offshore healthcare company in Nigeria. 
You assist website visitors with questions about:
- Services: offshore medics, occupational health, telemedicine, emergency medical support, clinic setup, remote monitoring
- Careers and job openings
- Contact info: Phone: ${phone}, Email: ${email}, Address: ${address}
- How to request emergency or urgent support
- Industries served: oil & gas, manufacturing, construction, maritime

Keep replies concise, warm, and professional. Use simple formatting. If asked for detailed pricing or contracts, invite them to contact the team directly. Do not make up specific numbers or guarantees.`;

    const conversationHistory = messages.slice(-8).map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");

    const result = await api.integrations.Core.InvokeLLM({
      prompt: `${systemContext}\n\nConversation so far:\n${conversationHistory}\n\nUser: ${userText}\nAssistant:`,
    });

    setMessages(prev => [...prev, { role: "assistant", text: typeof result === "string" ? result : result?.response || "I'm not sure about that. Please contact our team directly." }]);
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 2, type: "spring", stiffness: 200 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-2xl shadow-primary/30 transition-colors flex items-center gap-2"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-24px)] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <AnthonyAvatar size="w-9 h-9" />
                <div>
                  <div className="text-white font-semibold text-sm leading-tight">Anthony</div>
                  <div className="text-white/70 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />TRUV Virtual Assistant
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "user" ? (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-primary">U</div>
                  ) : (
                    <AnthonyAvatar />
                  )}
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Quick Replies — show only at start */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {QUICK_REPLIES.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors font-medium">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 shrink-0">
              <div className="flex gap-2 bg-muted/50 border border-border rounded-xl overflow-hidden pl-3 pr-1 py-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type a message..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1.5 disabled:opacity-60"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-lg bg-primary disabled:opacity-40 flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}