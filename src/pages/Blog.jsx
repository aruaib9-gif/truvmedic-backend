import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SocialShareButtons from "@/components/shared/SocialShareButtons";
import NewsletterSection from "@/components/shared/NewsletterSection";
import { Calendar, Clock, User, Search } from "lucide-react";
import { format } from "date-fns";

const categoryLabels = {
  occupational_health: "Occupational Health",
  offshore_medicine: "Offshore Medicine",
  telemedicine: "Telemedicine",
  industry_news: "Industry News",
  compliance: "Compliance",
  technology: "Technology",
  case_study: "Case Study",
};

const defaultPosts = [
  {
    id: "1",
    title: "Best Practices for Offshore Medical Emergency Response",
    excerpt: "A comprehensive guide to establishing robust emergency response protocols for offshore operations, including team training, equipment readiness, and communication systems.",
    category: "offshore_medicine",
    author_name: "Dr. Emeka Nwankwo",
    author_role: "Chief Medical Officer",
    published_date: "2026-05-10",
    read_time: 8,
  },
  {
    id: "2",
    title: "The Role of Telemedicine in Remote Industrial Healthcare",
    excerpt: "How telemedicine platforms are transforming healthcare delivery in remote and offshore environments, improving access to specialist care and reducing evacuation costs.",
    category: "telemedicine",
    author_name: "Dr. Aisha Ibrahim",
    author_role: "Head of Digital Health",
    published_date: "2026-05-05",
    read_time: 6,
  },
  {
    id: "3",
    title: "Regulatory Compliance in Nigerian Occupational Health",
    excerpt: "Understanding the regulatory landscape for occupational health services in Nigeria's oil & gas sector, and strategies for maintaining full compliance.",
    category: "compliance",
    author_name: "Engr. Chidi Okonkwo",
    author_role: "Compliance Director",
    published_date: "2026-04-28",
    read_time: 10,
  },
  {
    id: "4",
    title: "How Remote Patient Monitoring Reduces Industrial Downtime",
    excerpt: "Data-driven insights on how continuous health monitoring of industrial workers leads to early intervention and significant reductions in lost-time incidents.",
    category: "technology",
    author_name: "Dr. Funke Adeyemi",
    author_role: "Technology Lead",
    published_date: "2026-04-20",
    read_time: 7,
  },
];

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: dbPosts } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => api.entities.BlogPost.filter({ published: true }),
    initialData: [],
  });

  const posts = dbPosts.length > 0 ? dbPosts : defaultPosts;

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">Blog & Insights</span>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white leading-tight max-w-3xl">
              Industry Knowledge & Healthcare Insights
            </h1>
            <p className="text-lg text-white/70 mt-6 max-w-2xl">
              Expert perspectives on occupational health, offshore medicine, compliance, and healthcare technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveCategory("all")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                All
              </button>
              {Object.entries(categoryLabels).slice(0, 5).map(([key, label]) => (
                <button key={key} onClick={() => setActiveCategory(key)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl font-heading font-bold text-primary/10">{post.title[0]}</div>
                  )}
                </div>
                <div className="p-6">
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {categoryLabels[post.category] || post.category}
                  </Badge>
                  <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {post.author_name}
                    </div>
                    <div className="flex items-center gap-3">
                      {post.published_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.published_date), "MMM d, yyyy")}
                        </span>
                      )}
                      {post.read_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.read_time} min
                        </span>
                      )}
                    </div>
                  </div>
                  <SocialShareButtons title={post.title} url={`${window.location.origin}/blog`} />
                </div>
              </motion.article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No articles found.</div>
          )}
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}