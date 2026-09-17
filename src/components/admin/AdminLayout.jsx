import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard, Users, Briefcase, FileText, Star,
  AlertTriangle, Settings, ChevronLeft, ChevronRight,
  LogOut, Menu, Globe, BookOpen, Database, UserCog,
  MessageSquare, ShieldCheck
} from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Leads / CRM", icon: Users, path: "/admin/leads" },
  { label: "Emergency Requests", icon: AlertTriangle, path: "/admin/emergencies" },
  { label: "Job Applications", icon: Briefcase, path: "/admin/applications" },
  { label: "Candidate Database", icon: Database, path: "/admin/candidates" },
  { label: "Job Postings", icon: FileText, path: "/admin/job-postings" },
  { label: "Blog Posts", icon: BookOpen, path: "/admin/blog" },
  { label: "Testimonials", icon: Star, path: "/admin/testimonials" },
  { label: "Website Content", icon: Globe, path: "/admin/content" },
  { label: "Site Config & Social", icon: Settings, path: "/admin/site-config" },
  { label: "Users & Roles", icon: UserCog, path: "/admin/users" },
  { label: "Role Permissions", icon: ShieldCheck, path: "/admin/role-permissions" },
  { label: "Internal Messaging", icon: MessageSquare, path: "/admin/messaging" },
];

const NEW_LOGO_URL = "/logo.png";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) return;
    setCurrentUser(user);
    api.entities.InternalMessage.filter({ to_user_id: user.id, read: false })
      .then(msgs => setUnreadMsgs(msgs.length))
      .catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-2 px-4 py-4 border-b border-white/10", collapsed && "justify-center px-2")}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">T</span>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-0.5">
            <img src={config.logo_url || NEW_LOGO_URL} alt="TRUV Medical" className="h-10 object-contain" />
            <div className="text-white/40 text-[10px] pl-0.5">Admin Portal</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 transition-all text-sm",
                active
                  ? "bg-primary text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <span className="flex-1 flex items-center justify-between gap-2">
                  {item.label}
                  {item.path === "/admin/messaging" && unreadMsgs > 0 && (
                    <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none font-bold min-w-[18px] text-center">
                      {unreadMsgs}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link
          to="/"
          className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all", collapsed && "justify-center px-2")}
        >
          <Globe className="w-4 h-4 shrink-0" />
          {!collapsed && <span>View Website</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-all", collapsed && "justify-center px-2")}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-[#0A1628] transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full bg-[#0A1628] border border-white/10 rounded-r-full p-1 text-white/50 hover:text-white z-10"
          style={{ marginLeft: collapsed ? "4rem" : "14rem", transition: "margin 0.3s" }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 bg-[#0A1628] z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-card border-b flex items-center justify-between px-4 shrink-0">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block text-sm font-medium text-muted-foreground">
            {navItems.find(n => n.path === location.pathname)?.label || "Admin"}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {unreadMsgs > 0 && (
              <Link to="/admin/messaging" className="relative p-1.5 rounded-lg hover:bg-muted transition-colors">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 text-[10px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {unreadMsgs}
                </span>
              </Link>
            )}
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {(currentUser?.full_name || currentUser?.email || "A")[0].toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs font-medium text-foreground">{currentUser?.full_name || currentUser?.email || "User"}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{currentUser?.role || "staff"}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}