import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const token = params.get("token");

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteError, setInviteError] = useState(null);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setInviteError("This invitation link is missing its token.");
      setLoading(false);
      return;
    }

    api.auth
      .getInvite(token)
      .then(setInvite)
      .catch((err) => setInviteError(err.message || "This invitation is no longer valid."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await api.auth.acceptInvite({ token, password, full_name: fullName.trim() });
      setUser(user);
      toast.success("Welcome to the team");
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Could not accept this invitation");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthShell title="Checking your invitation">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </AuthShell>
    );
  }

  if (inviteError) {
    return (
      <AuthShell title="Invitation unavailable" subtitle={inviteError}>
        <p className="text-sm text-muted-foreground">
          Ask an administrator to send you a fresh invitation, or{" "}
          <Link to="/login" className="text-primary hover:underline">sign in</Link> if you already
          have an account.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set your password"
      subtitle={`You've been invited to the TRUV Medical admin portal as ${invite.email}.`}
    >
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">Role:</span>
        <Badge variant="secondary" className="capitalize">{invite.role}</Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full gap-2" disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Activate my account
        </Button>
      </form>
    </AuthShell>
  );
}
