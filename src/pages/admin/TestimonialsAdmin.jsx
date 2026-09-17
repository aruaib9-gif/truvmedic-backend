import React, { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const emptyForm = { client_name: "", company: "", role: "", content: "", rating: 5, industry: "", featured: false };

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    const data = await api.entities.Testimonial.list("-created_date", 100);
    setTestimonials(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const openEdit = (t) => { setEditing(t.id); setForm({ ...t }); };
  const openNew = () => { setEditing("new"); setForm(emptyForm); };
  const cancel = () => setEditing(null);

  const handleSave = async () => {
    if (editing === "new") {
      await api.entities.Testimonial.create(form);
      toast.success("Testimonial created");
    } else {
      await api.entities.Testimonial.update(editing, form);
      toast.success("Testimonial updated");
    }
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    await api.entities.Testimonial.delete(id);
    toast.success("Deleted");
    fetchData();
  };

  const toggleFeatured = async (t) => {
    await api.entities.Testimonial.update(t.id, { featured: !t.featured });
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Testimonials</h1>
          <p className="text-muted-foreground text-sm">{testimonials.filter(t => t.featured).length} featured, {testimonials.length} total</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />Add Testimonial</Button>
      </div>

      {/* Edit Panel */}
      {editing && (
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold">{editing === "new" ? "New Testimonial" : "Edit Testimonial"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Client Name *</label>
              <Input value={form.client_name} onChange={e => set("client_name", e.target.value)} placeholder="Name" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Company</label>
              <Input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Company name" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Role / Title</label>
              <Input value={form.role} onChange={e => set("role", e.target.value)} placeholder="HSE Manager" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Industry</label>
              <Input value={form.industry} onChange={e => set("industry", e.target.value)} placeholder="Oil & Gas" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Rating (1–5)</label>
              <Input type="number" value={form.rating} onChange={e => set("rating", parseInt(e.target.value))} min={1} max={5} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} className="rounded" />Featured on homepage
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Testimonial Content *</label>
            <Textarea value={form.content} onChange={e => set("content", e.target.value)} rows={5} placeholder="What the client said..." />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={cancel}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="grid md:grid-cols-2 gap-4">
        {testimonials.map(t => (
          <div key={t.id} className={`bg-card rounded-xl border p-4 ${t.featured ? "border-accent/40 bg-accent/5" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold">{t.client_name}</div>
                <div className="text-xs text-muted-foreground">{t.role} — {t.company}</div>
                <div className="text-xs text-muted-foreground">{t.industry}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleFeatured(t)} title={t.featured ? "Remove from featured" : "Feature"}>
                  <Star className={`w-4 h-4 ${t.featured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                </button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
            <div className="flex mb-2">
              {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{t.content}</p>
          </div>
        ))}
        {testimonials.length === 0 && <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border md:col-span-2">No testimonials yet</div>}
      </div>
    </div>
  );
}