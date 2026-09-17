import React, { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import JobShareBar from "@/components/admin/JobShareBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const emptyJob = { title: "", department: "offshore_medical", location: "", type: "full_time", description: "", salary_range: "", active: true, urgent: false, requirements: [], certifications_required: [] };

export default function JobPostingsAdmin() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyJob);
  const [reqInput, setReqInput] = useState("");
  const [certInput, setCertInput] = useState("");

  const fetchData = async () => {
    const data = await api.entities.JobPosting.list("-created_date", 100);
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const openEdit = (job) => {
    setEditing(job.id);
    setForm({ ...job });
  };
  const openNew = () => {
    setEditing("new");
    setForm(emptyJob);
    setReqInput("");
    setCertInput("");
  };
  const cancel = () => { setEditing(null); };

  const handleSave = async () => {
    if (editing === "new") {
      await api.entities.JobPosting.create(form);
      toast.success("Job posting created");
    } else {
      await api.entities.JobPosting.update(editing, form);
      toast.success("Job posting updated");
    }
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job posting?")) return;
    await api.entities.JobPosting.delete(id);
    toast.success("Deleted");
    fetchData();
  };

  const toggleActive = async (job) => {
    await api.entities.JobPosting.update(job.id, { active: !job.active });
    fetchData();
  };

  const addTag = (field, input, setter) => {
    const val = input.trim();
    if (!val) return;
    set(field, [...(form[field] || []), val]);
    setter("");
  };
  const removeTag = (field, idx) => set(field, form[field].filter((_, i) => i !== idx));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Job Postings</h1>
          <p className="text-muted-foreground text-sm">{jobs.filter(j => j.active).length} active, {jobs.length} total</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />New Posting</Button>
      </div>

      {/* Edit Panel */}
      {editing && (
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold">{editing === "new" ? "New Job Posting" : "Edit Job Posting"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Job Title *</label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Offshore Medic" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Department</label>
              <Select value={form.department} onValueChange={v => set("department", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["offshore_medical","occupational_health","emergency_response","telemedicine","hse","administration","management"].map(v => (
                    <SelectItem key={v} value={v}>{v.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Location</label>
              <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Lagos, Nigeria" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Type</label>
              <Select value={form.type} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["full_time","contract","rotational","part_time"].map(v => (
                    <SelectItem key={v} value={v}>{v.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Salary Range</label>
              <Input value={form.salary_range} onChange={e => set("salary_range", e.target.value)} placeholder="e.g. ₦800,000 – ₦1,200,000" />
            </div>
            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.active} onChange={e => set("active", e.target.checked)} className="rounded" />Active
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.urgent} onChange={e => set("urgent", e.target.checked)} className="rounded" />Urgent
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Description</label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Requirements</label>
              <div className="flex gap-2 mb-2">
                <Input value={reqInput} onChange={e => setReqInput(e.target.value)} placeholder="Add requirement..." onKeyDown={e => e.key === "Enter" && addTag("requirements", reqInput, setReqInput)} />
                <Button type="button" size="sm" onClick={() => addTag("requirements", reqInput, setReqInput)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1">{(form.requirements||[]).map((r,i) => <span key={i} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">{r}<button onClick={() => removeTag("requirements", i)} className="text-muted-foreground hover:text-destructive">×</button></span>)}</div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Required Certifications</label>
              <div className="flex gap-2 mb-2">
                <Input value={certInput} onChange={e => setCertInput(e.target.value)} placeholder="e.g. BOSIET..." onKeyDown={e => e.key === "Enter" && addTag("certifications_required", certInput, setCertInput)} />
                <Button type="button" size="sm" onClick={() => addTag("certifications_required", certInput, setCertInput)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1">{(form.certifications_required||[]).map((c,i) => <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded flex items-center gap-1">{c}<button onClick={() => removeTag("certifications_required", i)} className="text-muted-foreground hover:text-destructive">×</button></span>)}</div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={cancel}>Cancel</Button>
            <Button onClick={handleSave}>Save Posting</Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.id} className={`bg-card rounded-xl border p-4 ${!job.active ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold">{job.title}</span>
                  {job.urgent && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" />Urgent</span>}
                  {!job.active && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>}
                </div>
                <div className="text-sm text-muted-foreground">{job.department?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())} · {job.location} · {job.type?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(job)} title={job.active ? "Deactivate" : "Activate"}>
                  {job.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(job)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(job.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            {job.requirements?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">{job.requirements.slice(0,4).map(r => <span key={r} className="text-xs bg-muted px-2 py-0.5 rounded">{r}</span>)}</div>
            )}
            {/* Social Share Row */}
            {job.active && <JobShareBar job={job} />}
          </div>
        ))}
      </div>
    </div>
  );
}