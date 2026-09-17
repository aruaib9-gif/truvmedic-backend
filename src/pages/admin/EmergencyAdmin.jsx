import React, { useEffect, useState } from "react";
import { api } from "@/api/client";
import { AlertTriangle, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const URGENCY_COLORS = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
};
const STATUS_COLORS = {
  received: "bg-red-100 text-red-700",
  responding: "bg-orange-100 text-orange-700",
  deployed: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

export default function EmergencyAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  const fetchData = async () => {
    const data = await api.entities.EmergencyRequest.list("-created_date", 100);
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id, status) => {
    await api.entities.EmergencyRequest.update(id, { status });
    toast.success("Status updated");
    fetchData();
  };

  const filtered = requests.filter(r => {
    if (filter === "active") return r.status !== "resolved";
    if (filter === "resolved") return r.status === "resolved";
    return true;
  });

  const activeCount = requests.filter(r => r.status === "received").length;
  const respondingCount = requests.filter(r => r.status === "responding").length;
  const resolvedCount = requests.filter(r => r.status === "resolved").length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-red-600" /> Emergency Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor and respond to emergency requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{activeCount}</div>
          <div className="text-xs text-red-600">Received / Pending</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-700">{respondingCount}</div>
          <div className="text-xs text-orange-600">Responding</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{resolvedCount}</div>
          <div className="text-xs text-green-600">Resolved</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["active","all","resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.map(req => (
          <div key={req.id} className={`bg-card rounded-xl border p-5 ${req.urgency === "critical" && req.status !== "resolved" ? "border-red-300 shadow-red-100 shadow-md" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${URGENCY_COLORS[req.urgency]}`}>{req.urgency?.toUpperCase()}</span>
                  <span className="font-heading font-bold text-base">{req.contact_name}</span>
                </div>
                <div className="text-sm text-muted-foreground font-medium">{req.company}</div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={req.status} onValueChange={v => updateStatus(req.id, v)}>
                  <SelectTrigger className={`h-8 text-xs border font-medium w-32 ${STATUS_COLORS[req.status]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["received","responding","deployed","resolved"].map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="w-4 h-4 shrink-0 text-orange-500" />
                <span className="capitalize">{req.emergency_type?.replace(/_/g, " ")}</span>
              </div>
              {req.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  <a href={`tel:${req.phone}`} className="hover:text-primary">{req.phone}</a>
                </div>
              )}
              {req.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{req.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{new Date(req.created_date).toLocaleString()}</span>
              </div>
            </div>

            {req.description && (
              <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Description: </span>{req.description}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p>No {filter !== "all" ? filter : ""} emergency requests</p>
          </div>
        )}
      </div>
    </div>
  );
}