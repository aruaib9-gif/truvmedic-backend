import React, { useState } from "react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export default function NewsletterSection() {
  const { config } = useSiteConfig();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (config.newsletter_enabled === false) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.entities.NewsletterSubscriber.create({ email, full_name: name, subscribed: true, source: "newsletter_section" });
      setDone(true);
      toast.success("You're subscribed! Thank you.");
    } catch {
      toast.error("Subscription failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary to-[#1B3A5C]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Mail className="w-4 h-4" /> Healthcare Insights Newsletter
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Stay Ahead in Industrial Healthcare
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            Get the latest insights on occupational health, offshore medicine, compliance updates, and industry news delivered straight to your inbox.
          </p>

          {done ? (
            <div className="flex items-center justify-center gap-3 text-white bg-white/10 rounded-xl px-8 py-6 max-w-md mx-auto">
              <CheckCircle className="w-6 h-6 text-accent" />
              <span className="font-medium text-lg">You're subscribed! Welcome aboard.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
              />
              <Input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
              />
              <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 text-white shrink-0 gap-2">
                {loading ? "Subscribing..." : <><ArrowRight className="w-4 h-4" /> Subscribe</>}
              </Button>
            </form>
          )}

          <p className="text-white/40 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
}