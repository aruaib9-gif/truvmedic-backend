import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/api/client";
import {
  Search, Filter, Tag, StickyNote,
  Mail, Phone, X, Plus, ChevronDown, ChevronUp, Users,
  Briefcase, Award, Save, Check
} from "lucide-react";
import DocumentViewer from "@/components/admin/DocumentViewer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const DEPT_LABELS = {
  offshore_medical: "Offshore Medical",
  occupational_health: "Occupational Health",
  emergency_response: "Emergency Response",
  telemedicine: "Telemedicine",
  hse: "HSE",
  administration: "Administration",
  management: "Management",
};

const STATUS_COLORS = {
  received: "bg-blue-100 text-blue-700",
  reviewing: "bg-yellow-100 text-yellow-700",
  shortlisted: "bg-purple-100 text-purple-700",
  interview: "bg-orange-100 text-orange-700",
  offered: "bg-teal-100 text-teal-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const PRESET_TAGS = [
  "Strong Candidate", "Pipeline", "Future Opening", "Re-consider",
  "Culture Fit", "Offshore Ready", "Senior Level", "Follow Up"
];

function TagPill({ tag, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-destructive ml-0.5">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

function CandidateCard({ candidate, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(candidate.recruiter_notes || "");
  const [tags, setTags] = useState(candidate.tags || []);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  const saveNotesAndTags = async () => {
    setSaving(true);
    await api.entities.JobApplication.update(candidate.id, { recruiter_notes: notes, tags });
    toast.success("Saved");
    setSaving(false);
    setEditingNotes(false);
    onUpdate({ ...candidate, recruiter_notes: notes, tags });
  };

  const addTag = (tag) => {
    if (!tag.trim() || tags.includes(tag.trim())) return;
    setTags(prev => [...prev, tag.trim()]);
    setNewTag("");
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  return (
    <div className={`bg-card rounded-xl border transition-all ${expanded ? "border-primary shadow-md" : "hover:shadow-sm"}`}>
      {/* Header Row */}
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-foreground">{candidate.full_name}</span>
              {candidate.offshore_certified && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Offshore Certified</span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[candidate.status]}`}>
                {candidate.status}
              </span>
            </div>
            <div className="text-sm text-primary font-medium mb-1">{candidate.job_title}</div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {candidate.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{candidate.email}</span>}
              {candidate.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{candidate.phone}</span>}
              {candidate.years_experience != null && candidate.years_experience !== "" && (
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{candidate.years_experience} yrs exp</span>
              )}
              {candidate.certifications?.length > 0 && (
                <span className="flex items-center gap-1"><Award className="w-3 h-3" />{candidate.certifications.length} cert(s)</span>
              )}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(t => <TagPill key={t} tag={t} />)}
              </div>
            )}
          </div>
          <div className="shrink-0 text-muted-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t space-y-4">
          {/* Certifications */}
          {candidate.certifications?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Certifications</div>
              <div className="flex flex-wrap gap-1">
                {candidate.certifications.map(c => (
                  <span key={c} className="text-xs bg-accent/10 text-accent-foreground border border-accent/20 px-2 py-0.5 rounded">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {candidate.cover_letter && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Cover Letter</div>
              <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3 leading-relaxed">{candidate.cover_letter}</p>
            </div>
          )}

          {/* Documents & Certificates */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Documents & Certificates</div>
            <DocumentViewer application={candidate} onUpdate={onUpdate} />
          </div>

          {/* Tags */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />Tags
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map(t => <TagPill key={t} tag={t} onRemove={() => removeTag(t)} />)}
              {tags.length === 0 && <span className="text-xs text-muted-foreground italic">No tags yet</span>}
            </div>
            {/* Preset Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {PRESET_TAGS.filter(t => !tags.includes(t)).map(t => (
                <button key={t} onClick={() => addTag(t)}
                  className="text-xs border border-dashed border-border rounded-full px-2 py-0.5 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  + {t}
                </button>
              ))}
            </div>
            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(newTag); } }}
                className="h-7 text-xs"
              />
              <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => addTag(newTag)}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Recruiter Notes */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" />Recruiter Notes
            </div>
            {editingNotes ? (
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add private notes about this candidate..."
                rows={3}
                className="text-sm"
                autoFocus
              />
            ) : (
              <div
                onClick={() => setEditingNotes(true)}
                className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3 cursor-text min-h-[60px] hover:bg-muted/60 transition-colors"
              >
                {notes || <span className="italic">Click to add notes...</span>}
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button size="sm" onClick={saveNotesAndTags} disabled={saving} className="gap-1.5">
            {saving ? <><Save className="w-3.5 h-3.5" />Saving...</> : <><Check className="w-3.5 h-3.5" />Save Notes & Tags</>}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CandidateDatabase() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterCert, setFilterCert] = useState("all");
  const [filterExpMin, setFilterExpMin] = useState("");
  const [filterExpMax, setFilterExpMax] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    const data = await api.entities.JobApplication.list("-created_date", 500);
    // Deduplicate: keep the most recent application per unique email
    const seen = new Map();
    data.forEach(c => {
      const key = c.email?.toLowerCase();
      if (!key) return;
      if (!seen.has(key)) seen.set(key, c);
    });
    setCandidates([...seen.values()]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = (updated) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Collect all unique certs & tags across candidates
  const allCerts = useMemo(() => {
    const s = new Set();
    candidates.forEach(c => c.certifications?.forEach(cert => s.add(cert)));
    return [...s].sort();
  }, [candidates]);

  const allTags = useMemo(() => {
    const s = new Set();
    candidates.forEach(c => c.tags?.forEach(t => s.add(t)));
    return [...s].sort();
  }, [candidates]);

  const filtered = useMemo(() => candidates.filter(c => {
    if (search) {
      const q = search.toLowerCase();
      const match = [c.full_name, c.email, c.phone, c.job_title, ...(c.certifications || []), ...(c.tags || [])]
        .some(f => f?.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterDept !== "all" && c.department !== filterDept) return false;
    if (filterCert !== "all" && !c.certifications?.includes(filterCert)) return false;
    if (filterExpMin !== "" && (c.years_experience ?? 0) < Number(filterExpMin)) return false;
    if (filterExpMax !== "" && (c.years_experience ?? 0) > Number(filterExpMax)) return false;
    if (filterTag !== "all" && !c.tags?.includes(filterTag)) return false;
    return true;
  }), [candidates, search, filterStatus, filterDept, filterCert, filterExpMin, filterExpMax, filterTag]);

  const activeFilterCount = [filterDept, filterCert, filterExpMin, filterExpMax, filterTag, filterStatus]
    .filter(v => v !== "all" && v !== "").length;

  const clearFilters = () => {
    setFilterDept("all"); setFilterCert("all"); setFilterExpMin("");
    setFilterExpMax(""); setFilterTag("all"); setFilterStatus("all");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold">Candidate Database</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} of {candidates.length} candidates</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-semibold">{candidates.length}</span> total applicants
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, email, role, cert, tag..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(f => !f)} className="gap-2 relative">
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-destructive">
            <X className="w-3.5 h-3.5 mr-1" />Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-muted/30 border border-border rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {["received","reviewing","shortlisted","interview","offered","hired","rejected"].map(s => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {Object.entries(DEPT_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCert} onValueChange={setFilterCert}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Certification" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Certs</SelectItem>
              {allCerts.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Input
            type="number" min="0" placeholder="Min exp (yrs)"
            value={filterExpMin} onChange={e => setFilterExpMin(e.target.value)}
            className="h-8 text-xs"
          />
          <Input
            type="number" min="0" placeholder="Max exp (yrs)"
            value={filterExpMax} onChange={e => setFilterExpMax(e.target.value)}
            className="h-8 text-xs"
          />

          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Candidate Cards */}
      <div className="space-y-3">
        {filtered.map(c => (
          <CandidateCard key={c.id} candidate={c} onUpdate={handleUpdate} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No candidates match your filters.
          </div>
        )}
      </div>
    </div>
  );
}