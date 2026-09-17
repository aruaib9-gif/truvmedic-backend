import React, { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Users, Mail, Shield, Edit2, Check, X, UserPlus, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700",
  recruiter: "bg-blue-100 text-blue-700",
  manager: "bg-purple-100 text-purple-700",
  viewer: "bg-gray-100 text-gray-700",
};

const ROLE_DESCRIPTIONS = {
  admin: "Full access — manage all data, users, and settings",
  recruiter: "Manage job applications, candidates, and job postings",
  manager: "View all data; update leads, emergencies, and applications",
  viewer: "Read-only access to all sections",
};

function InviteUserRow({ onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.users.inviteUser(email.trim(), role);
      toast.success(`Invite sent to ${email}. They'll join as a ${role} once they set a password.`);
      setEmail("");
      setRole("viewer");
      if (onInvited) onInvited();
    } catch (err) {
      toast.error("Failed to send invite. " + (err?.message || ""));
    }
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-xl border p-4">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-primary" /> Invite New User
      </h3>
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 min-w-48"
          onKeyDown={e => e.key === "Enter" && handleInvite()}
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["admin", "recruiter", "manager", "viewer"].map(r => (
              <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleInvite} disabled={loading || !email.trim()} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Send Invite
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{ROLE_DESCRIPTIONS[role]}</p>
      <p className="text-xs text-muted-foreground mt-1">
        The invitation link expires in 7 days.
      </p>
    </div>
  );
}

function UserRow({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(user.role || "viewer");
  const [notes, setNotes] = useState(user.notes || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await api.entities.User.update(user.id, { role, notes });
    toast.success("User updated");
    setSaving(false);
    setEditing(false);
    onUpdate({ ...user, role, notes });
  };

  const cancel = () => {
    setRole(user.role || "viewer");
    setNotes(user.notes || "");
    setEditing(false);
  };

  return (
    <div className={`bg-card rounded-xl border p-4 transition-all ${editing ? "border-primary shadow-sm" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {(user.full_name || user.email || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{user.full_name || "—"}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 shrink-0" />{user.email}
            </div>
            {user.department && <div className="text-xs text-muted-foreground">{user.department}</div>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editing ? (
            <>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-7 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["admin", "recruiter", "manager", "viewer"].map(r => (
                    <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-7 px-2" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={cancel}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[user.role] || "bg-gray-100 text-gray-700"}`}>
                <Shield className="w-3 h-3 inline mr-1" />{user.role || "viewer"}
              </span>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditing(true)}>
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-3 pt-3 border-t">
          <label className="text-xs font-medium block mb-1">Admin Notes</label>
          <Input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes about this user..."
            className="text-xs h-8"
          />
          <p className="text-xs text-muted-foreground mt-1">{ROLE_DESCRIPTIONS[role]}</p>
        </div>
      )}
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const fetchUsers = async () => {
    const data = await api.entities.User.list("-created_date", 200);
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = (updated) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || [u.full_name, u.email, u.department].some(f => f?.toLowerCase().includes(q));
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCounts = ["admin", "recruiter", "manager", "viewer"].map(r => ({
    role: r,
    count: users.filter(u => u.role === r).length,
  }));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-heading font-bold">User & Role Management</h1>
        <p className="text-muted-foreground text-sm">{users.length} registered users</p>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roleCounts.map(({ role, count }) => (
          <div key={role} className={`rounded-xl p-3 border text-center ${ROLE_COLORS[role]}`}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs capitalize font-medium">{role}</div>
          </div>
        ))}
      </div>

      {/* Invite Row */}
      <InviteUserRow onInvited={fetchUsers} />

      {/* Role Legend */}
      <div className="bg-muted/30 rounded-xl border p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Role Permissions</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {Object.entries(ROLE_DESCRIPTIONS).map(([r, desc]) => (
            <div key={r} className="flex items-start gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${ROLE_COLORS[r]}`}>{r}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {["admin", "recruiter", "manager", "viewer"].map(r => (
              <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filtered.map(u => (
          <UserRow key={u.id} user={u} onUpdate={handleUpdate} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl border text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}