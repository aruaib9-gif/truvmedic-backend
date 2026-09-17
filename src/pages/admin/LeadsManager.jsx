import React, { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Search, Plus, Pencil, Trash2, Phone, Mail, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LeadDetailModal from "@/components/admin/LeadDetailModal";
import { toast } from "sonner";

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-purple-100 text-purple-700",
  proposal: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-50 text-blue-600",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function LeadsManager() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchLeads = async () => {
    const data = await api.entities.Lead.list("-created_date", 200);
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = leads.filter(l => {
    const matchSearch = !search || [l.full_name, l.email, l.company, l.phone].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchPriority = priorityFilter === "all" || l.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleEdit = (lead) => { setSelectedLead(lead); setShowModal(true); };
  const handleNew = () => { setSelectedLead(null); setShowModal(true); };
  const handleDelete = async (id) => {
    if (!confirm("Delete this lead?")) return;
    await api.entities.Lead.delete(id);
    toast.success("Lead deleted");
    fetchLeads();
  };
  const handleSave = async (data) => {
    if (selectedLead) {
      await api.entities.Lead.update(selectedLead.id, data);
      toast.success("Lead updated");
    } else {
      await api.entities.Lead.create({ ...data, source: "website" });
      toast.success("Lead created");
    }
    setShowModal(false);
    fetchLeads();
  };

  const updateStatus = async (id, status) => {
    await api.entities.Lead.update(id, { status });
    toast.success("Status updated");
    fetchLeads();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Leads / CRM</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} leads found</p>
        </div>
        <Button onClick={handleNew} className="gap-2"><Plus className="w-4 h-4" />Add Lead</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, email, company..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {["new","contacted","qualified","proposal","won","lost"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {["low","medium","high","urgent"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {["new","contacted","qualified","proposal","won","lost"].map(s => (
          <div key={s} className={`rounded-lg p-2 text-center ${STATUS_COLORS[s]} bg-opacity-50 border`}>
            <div className="text-lg font-bold">{leads.filter(l => l.status === s).length}</div>
            <div className="text-xs capitalize">{s}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b text-left">
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Company</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Service</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Priority</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Source</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.full_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</div>
                    {lead.phone && <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    <div className="flex items-center gap-1"><Building className="w-3 h-3" />{lead.company || "—"}</div>
                    <div className="text-xs capitalize">{lead.industry?.replace(/_/g, " ")}</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground capitalize">{lead.service_interest?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                      <SelectTrigger className={`h-7 text-xs border-0 px-2 py-0 ${STATUS_COLORS[lead.status]} font-medium w-28`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["new","contacted","qualified","proposal","won","lost"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[lead.priority] || PRIORITY_COLORS.medium}`}>{lead.priority || "medium"}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground capitalize">{lead.source}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(lead)}><Pencil className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(lead.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">No leads found</div>}
        </div>
      </div>

      {showModal && (
        <LeadDetailModal
          lead={selectedLead}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}