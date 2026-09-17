import React, { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Link } from "react-router-dom";
import { Users, AlertTriangle, Briefcase, TrendingUp, ArrowRight, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.entities.Lead.list("-created_date", 100),
      api.entities.EmergencyRequest.list("-created_date", 50),
      api.entities.JobApplication.list("-created_date", 50),
    ]).then(([l, e, a]) => {
      setLeads(l);
      setEmergencies(e);
      setApplications(a);
      setLoading(false);
    });
  }, []);

  const leadsByStatus = ["new", "contacted", "qualified", "proposal", "won", "lost"].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: leads.filter(l => l.status === s).length,
  }));

  const leadsByIndustry = leads.reduce((acc, l) => {
    if (!l.industry) return acc;
    const key = l.industry.replace(/_/g, " ");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const industryData = Object.entries(leadsByIndustry).map(([name, value]) => ({ name, value }));

  const COLORS = ["#1a5fa8", "#00bcd4", "#0d8da3", "#1976d2", "#e91e63", "#ff9800"];

  const stats = [
    { label: "Total Leads", value: leads.length, icon: Users, color: "text-primary", bg: "bg-primary/10", link: "/admin/leads" },
    { label: "New Leads", value: leads.filter(l => l.status === "new").length, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", link: "/admin/leads" },
    { label: "Emergency Requests", value: emergencies.filter(e => e.status !== "resolved").length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", link: "/admin/emergencies" },
    { label: "Applications", value: applications.length, icon: Briefcase, color: "text-accent", bg: "bg-accent/10", link: "/admin/applications" },
  ];

  const recentLeads = leads.slice(0, 6);
  const activeEmergencies = emergencies.filter(e => e.status === "received" || e.status === "responding").slice(0, 4);

  const { config } = useSiteConfig();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Banner */}
      {config.dashboard_image_url && (
        <div className="relative rounded-xl overflow-hidden h-40 md:h-52">
          <img src={config.dashboard_image_url} alt="Dashboard Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/80 to-transparent flex items-center px-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-white">CRM Dashboard</h1>
              <p className="text-white/70 text-sm mt-1">Overview of leads, emergencies, and applications</p>
            </div>
          </div>
          <Link to="/admin/site-config" className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1">
            <Settings className="w-3 h-3" /> Edit Banner
          </Link>
        </div>
      )}
      {!config.dashboard_image_url && (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">CRM Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Overview of leads, emergencies, and applications</p>
          </div>
          <Link to="/admin/site-config" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1">
            <Settings className="w-3 h-3" /> Add banner image
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.link} className="bg-card rounded-xl p-4 border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 border">
          <h3 className="font-semibold mb-4 text-sm">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={leadsByStatus}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl p-5 border">
          <h3 className="font-semibold mb-4 text-sm">Leads by Industry</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={industryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {industryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Emergencies */}
      {activeEmergencies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-red-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Active Emergencies</h3>
            <Link to="/admin/emergencies" className="text-xs text-red-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {activeEmergencies.map(e => (
              <div key={e.id} className="bg-white rounded-lg p-3 flex items-center justify-between border border-red-100">
                <div>
                  <div className="font-medium text-sm">{e.contact_name} — {e.company}</div>
                  <div className="text-xs text-muted-foreground">{e.emergency_type?.replace(/_/g, " ")} · {e.location}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${e.urgency === "critical" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                  {e.urgency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Leads */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-sm">Recent Leads</h3>
          <Link to="/admin/leads" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y">
          {recentLeads.map(lead => (
            <div key={lead.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div>
                <div className="font-medium text-sm">{lead.full_name}</div>
                <div className="text-xs text-muted-foreground">{lead.company} · {lead.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:block">{lead.service_interest?.replace(/_/g, " ")}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  lead.status === "new" ? "bg-blue-100 text-blue-700" :
                  lead.status === "won" ? "bg-green-100 text-green-700" :
                  lead.status === "lost" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>{lead.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}