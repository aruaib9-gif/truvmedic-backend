import React, { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Search, Mail, Phone, LayoutGrid, List, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DocumentViewer from "@/components/admin/DocumentViewer";
import KanbanBoard from "@/components/admin/KanbanBoard";
import InterviewModal from "@/components/admin/InterviewModal";
import CandidateMessaging from "@/components/admin/CandidateMessaging";

const STATUS_COLORS = {
  received: "bg-blue-100 text-blue-700",
  reviewing: "bg-yellow-100 text-yellow-700",
  shortlisted: "bg-purple-100 text-purple-700",
  interview: "bg-orange-100 text-orange-700",
  offered: "bg-teal-100 text-teal-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ApplicationsAdmin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("kanban"); // "kanban" | "list"
  const [interviewApp, setInterviewApp] = useState(null);

  const fetchData = async () => {
    const data = await api.entities.JobApplication.list("-created_date", 200);
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleKanbanUpdate = (id, newStatus) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const updateStatus = async (id, status) => {
    await api.entities.JobApplication.update(id, { status });
    toast.success("Status updated");
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const filtered = applications.filter(a => {
    const matchSearch = !search || [a.full_name, a.email, a.job_title].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">Job Applications</h1>
          <p className="text-muted-foreground text-sm">{applications.length} total applications</p>
        </div>
        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            size="sm"
            variant={view === "kanban" ? "default" : "ghost"}
            className="h-7 px-3 gap-1.5"
            onClick={() => setView("kanban")}
          >
            <LayoutGrid className="w-3.5 h-3.5" />Kanban
          </Button>
          <Button
            size="sm"
            variant={view === "list" ? "default" : "ghost"}
            className="h-7 px-3 gap-1.5"
            onClick={() => setView("list")}
          >
            <List className="w-3.5 h-3.5" />List
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {["received","reviewing","shortlisted","interview","offered","hired","rejected"].map(s => (
          <div key={s} className={`rounded-lg p-2 text-center cursor-pointer ${STATUS_COLORS[s]} border ${statusFilter === s ? "ring-2 ring-offset-1 ring-primary" : ""}`}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}>
            <div className="text-lg font-bold">{applications.filter(a => a.status === s).length}</div>
            <div className="text-xs capitalize">{s}</div>
          </div>
        ))}
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <KanbanBoard applications={filtered} onUpdate={handleKanbanUpdate} />
      )}

      {/* List View */}
      {view === "list" && (
        <>
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search applicants..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {["received","reviewing","shortlisted","interview","offered","hired","rejected"].map(s => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.map(app => (
              <div
                key={app.id}
                className={`bg-card rounded-xl border p-4 ${selected === app.id ? "border-primary" : ""} cursor-pointer hover:shadow-sm transition-all`}
                onClick={() => setSelected(selected === app.id ? null : app.id)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{app.full_name}</span>
                      {app.offshore_certified && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Offshore Certified</span>}
                    </div>
                    <div className="text-sm text-primary font-medium">{app.job_title}</div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      {app.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.email}</span>}
                      {app.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{app.phone}</span>}
                      {app.years_experience != null && <span>{app.years_experience} yrs experience</span>}
                      {app.available_date && <span>Available: {app.available_date}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 gap-1 text-xs"
                      onClick={e => { e.stopPropagation(); setInterviewApp(app); }}
                    >
                      <Send className="w-3 h-3" />Interview
                    </Button>
                    <Select value={app.status} onValueChange={v => { updateStatus(app.id, v); }}>
                      <SelectTrigger className={`h-7 text-xs border-0 font-medium w-28 ${STATUS_COLORS[app.status]}`} onClick={e => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["received","reviewing","shortlisted","interview","offered","hired","rejected"].map(s => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selected === app.id && (
                  <div className="mt-4 pt-4 border-t space-y-4" onClick={e => e.stopPropagation()}>
                    {app.cover_letter && (
                      <div>
                        <div className="text-xs font-medium mb-1">Cover Letter:</div>
                        <p className="text-sm text-muted-foreground bg-muted/40 rounded p-3">{app.cover_letter}</p>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Documents & Certificates</div>
                      <DocumentViewer
                        application={app}
                        onUpdate={(updated) => setApplications(prev => prev.map(a => a.id === updated.id ? updated : a))}
                      />
                    </div>
                    {/* In-app Messaging */}
                    <div className="border-t pt-4">
                      <CandidateMessaging application={app} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">No applications found</div>}
          </div>
        </>
      )}

      <InterviewModal
        application={interviewApp}
        open={!!interviewApp}
        onClose={() => setInterviewApp(null)}
        onSent={() => {
          if (interviewApp) handleKanbanUpdate(interviewApp.id, "interview");
          setInterviewApp(null);
        }}
      />
    </div>
  );
}