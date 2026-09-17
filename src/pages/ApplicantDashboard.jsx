import React, { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  Briefcase, Bell, MessageSquare, User, LogOut,
  Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight,
  FileText, Calendar, Loader2
} from "lucide-react";

const statusConfig = {
  received:    { label: "Received",    color: "bg-blue-100 text-blue-700",    icon: Clock },
  reviewing:   { label: "Reviewing",   color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
  shortlisted: { label: "Shortlisted", color: "bg-purple-100 text-purple-700", icon: CheckCircle2 },
  interview:   { label: "Interview",   color: "bg-indigo-100 text-indigo-700", icon: Calendar },
  offered:     { label: "Offered",     color: "bg-green-100 text-green-700",   icon: CheckCircle2 },
  hired:       { label: "Hired",       color: "bg-emerald-100 text-emerald-700",icon: CheckCircle2 },
  rejected:    { label: "Rejected",    color: "bg-red-100 text-red-700",       icon: XCircle },
};

function StatusBadge({ status }) {
  const s = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-700", icon: Clock };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
      <Icon className="w-3 h-3" />{s.label}
    </span>
  );
}

export default function ApplicantDashboard() {
  const { user, logout, isLoadingAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("applications");

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ["my-applications", user?.email],
    queryFn: () => user?.email
      ? api.entities.JobApplication.filter({ email: user.email })
      : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const { data: messages = [], isLoading: loadingMsgs } = useQuery({
    queryKey: ["my-messages", user?.email],
    queryFn: () => user?.email
      ? api.entities.CandidateMessage.filter({ candidate_email: user.email })
      : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const unreadMessages = messages.filter(m => m.direction === "outbound").length;

  // Show spinner while auth is being checked or user is being redirected
  if (isLoadingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1B3A5C] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                {user.full_name?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold">Welcome, {user.full_name?.split(" ")[0] || "Applicant"}</h1>
                <p className="text-white/60 text-sm">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/careers">
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 gap-2">
                  <Briefcase className="w-4 h-4" /> Browse Jobs
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 gap-2" onClick={() => logout()}>
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: "Applications", value: applications.length, icon: FileText },
              { label: "Messages", value: messages.length, icon: MessageSquare },
              { label: "Active", value: applications.filter(a => !["hired","rejected"].includes(a.status)).length, icon: Bell },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/10 rounded-lg px-4 py-3 text-center">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-white/60 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="applications" className="gap-2">
              <Briefcase className="w-4 h-4" /> My Applications
              {applications.length > 0 && (
                <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5">{applications.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Messages
              {messages.length > 0 && (
                <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5">{messages.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" /> Profile
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            {loadingApps ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground text-sm mb-6">Browse our open positions and submit your first application.</p>
                <Link to="/careers">
                  <Button className="gap-2"><Briefcase className="w-4 h-4" /> Browse Jobs</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border rounded-xl p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-semibold">{app.job_title}</h3>
                          <StatusBadge status={app.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Applied {new Date(app.created_date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        {app.department && (
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{app.department.replace(/_/g, " ")}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {app.resume_url && (
                          <a href={app.resume_url} target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-1 text-primary hover:underline text-xs">
                            <FileText className="w-3.5 h-3.5" /> View CV
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      {["received","reviewing","shortlisted","interview","offered","hired"].map((stage, idx) => {
                        const stages = ["received","reviewing","shortlisted","interview","offered","hired"];
                        const currentIdx = stages.indexOf(app.status);
                        const isRejected = app.status === "rejected";
                        const isPast = !isRejected && idx <= currentIdx;
                        const isCurrent = stage === app.status;
                        return (
                          <span key={stage} className="inline-flex items-center">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              isRejected ? "bg-muted text-muted-foreground" :
                              isCurrent ? "bg-primary text-white font-medium" :
                              isPast ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            }`}>
                              {statusConfig[stage]?.label || stage}
                            </span>
                            {idx < 5 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />}
                          </span>
                        );
                      })}
                      {app.status === "rejected" && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 ml-1">Rejected</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">No Messages Yet</h3>
                <p className="text-muted-foreground text-sm">Messages from our recruitment team will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{msg.subject || "Message from Recruitment"}</span>
                          {msg.message_type && msg.message_type !== "general" && (
                            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full capitalize">
                              {msg.message_type.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                        {msg.job_title && (
                          <p className="text-xs text-muted-foreground mt-0.5">Re: {msg.job_title}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(msg.created_date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-card border rounded-xl p-6 max-w-md">
              <h3 className="font-heading font-semibold text-lg mb-5">Your Profile</h3>
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-2">
                  {user.full_name?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="text-center mb-4">
                  <p className="font-semibold text-lg">{user.full_name}</p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member since</span>
                    <span>{new Date(user.created_date || Date.now()).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Applications</span>
                    <span className="font-medium">{applications.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Messages received</span>
                    <span className="font-medium">{messages.filter(m => m.direction === "outbound").length}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2 mt-4" onClick={() => logout()}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}