import React, { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Twitter, Facebook, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const emptyPost = { title: "", slug: "", excerpt: "", content: "", category: "occupational_health", author_name: "", author_role: "", published: false, published_date: "", read_time: 5, tags: [] };

export default function BlogAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPost);
  const [tagInput, setTagInput] = useState("");

  const fetchData = async () => {
    const data = await api.entities.BlogPost.list("-created_date", 100);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const openEdit = (post) => { setEditing(post.id); setForm({ ...post }); setTagInput(""); };
  const openNew = () => { setEditing("new"); setForm(emptyPost); setTagInput(""); };
  const cancel = () => setEditing(null);

  const handleSave = async () => {
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const data = { ...form, slug };
    if (editing === "new") {
      await api.entities.BlogPost.create(data);
      toast.success("Blog post created");
    } else {
      await api.entities.BlogPost.update(editing, data);
      toast.success("Post updated");
    }
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    await api.entities.BlogPost.delete(id);
    toast.success("Deleted");
    fetchData();
  };

  const togglePublished = async (post) => {
    await api.entities.BlogPost.update(post.id, { published: !post.published });
    fetchData();
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (!val) return;
    set("tags", [...(form.tags || []), val]);
    setTagInput("");
  };
  const removeTag = (idx) => set("tags", form.tags.filter((_, i) => i !== idx));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Blog Posts</h1>
          <p className="text-muted-foreground text-sm">{posts.filter(p => p.published).length} published, {posts.length} total</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />New Post</Button>
      </div>

      {/* Edit Panel */}
      {editing && (
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold">{editing === "new" ? "New Blog Post" : "Edit Blog Post"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-medium mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Post title" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Slug (auto-generated if empty)</label>
              <Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="url-friendly-slug" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Category</label>
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["occupational_health","offshore_medicine","telemedicine","industry_news","compliance","technology","case_study"].map(v => (
                    <SelectItem key={v} value={v}>{v.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Author Name</label>
              <Input value={form.author_name} onChange={e => set("author_name", e.target.value)} placeholder="Dr. John Doe" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Author Role</label>
              <Input value={form.author_role} onChange={e => set("author_role", e.target.value)} placeholder="Chief Medical Officer" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Published Date</label>
              <Input type="date" value={form.published_date} onChange={e => set("published_date", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Read Time (minutes)</label>
              <Input type="number" value={form.read_time} onChange={e => set("read_time", parseInt(e.target.value))} min={1} max={60} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} className="rounded" />Published
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Excerpt</label>
            <Textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} rows={2} placeholder="Short summary for listing pages..." />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Content</label>
            <Textarea value={form.content} onChange={e => set("content", e.target.value)} rows={10} placeholder="Full blog post content (Markdown supported)..." />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Cover Image</label>
            <div className="flex gap-2">
              <Input value={form.cover_image || ""} onChange={e => set("cover_image", e.target.value)} placeholder="https://... or upload below" className="flex-1" />
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const { file_url } = await api.integrations.Core.UploadFile({ file });
                  set("cover_image", file_url);
                }} />
                <Button type="button" variant="outline" size="sm" asChild>
                  <span><Upload className="w-4 h-4 mr-1" />Upload</span>
                </Button>
              </label>
            </div>
            {form.cover_image && <img src={form.cover_image} alt="Cover preview" className="mt-2 h-24 object-cover rounded border" />}
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..." onKeyDown={e => e.key === "Enter" && addTag()} />
              <Button type="button" size="sm" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1">{(form.tags||[]).map((t,i) => <span key={i} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">{t}<button onClick={() => removeTag(i)} className="hover:text-destructive">×</button></span>)}</div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={cancel}>Cancel</Button>
            <Button onClick={handleSave}>Save Post</Button>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className={`bg-card rounded-xl border p-4 ${!post.published ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{post.title}</span>
                  {!post.published && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Draft</span>}
                </div>
                <div className="text-xs text-muted-foreground">{post.category?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())} · {post.author_name} · {post.read_time} min read · {post.published_date}</div>
                {post.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>}
                {post.published && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Share:</span>
                    {[
                      { icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.origin + "/blog")}`, color: "text-sky-500" },
                      { icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + "/blog")}`, color: "text-blue-600" },
                      { icon: Linkedin, href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.origin + "/blog")}&title=${encodeURIComponent(post.title)}`, color: "text-blue-700" },
                    ].map(({ icon: Icon, href, color }) => (
                      <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={`p-1 rounded hover:bg-muted ${color}`}><Icon className="w-3.5 h-3.5" /></a>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublished(post)} title={post.published ? "Unpublish" : "Publish"}>
                  {post.published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(post.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">No blog posts yet</div>}
      </div>
    </div>
  );
}