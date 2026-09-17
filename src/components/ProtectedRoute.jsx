import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, STAFF_ROLES } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

/**
 * Gate for routes that need a signed-in user.
 * `requireStaff` additionally restricts the route to admin-portal roles.
 */
export default function ProtectedRoute({ requireStaff = false }) {
  const { isAuthenticated, isLoadingAuth, authChecked, user } = useAuth();
  const location = useLocation();

  if (isLoadingAuth || !authChecked) return <Spinner />;

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (requireStaff && !STAFF_ROLES.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="font-heading text-xl font-bold">Admin access required</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Your account ({user?.email}) doesn&apos;t have permission to open the admin portal.
            If you believe this is a mistake, ask an administrator to update your role.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button asChild variant="outline">
              <Link to="/">Back to site</Link>
            </Button>
            <Button asChild>
              <Link to="/applicant-dashboard">My applications</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
