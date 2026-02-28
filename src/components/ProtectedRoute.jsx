import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Wraps routes that require authentication.
 *
 * @param {Object}  props
 * @param {"patient"|"gp"} props.requiredRole - which role the user must have
 * @param {string}  props.redirectTo - where to send unauthenticated users
 * @param {React.ReactNode} props.children
 */
export default function ProtectedRoute({
  requiredRole,
  redirectTo,
  children,
}) {
  const { user, profile, loading, profileError } = useAuth();

  // Still initialising auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in at all → redirect to auth page
  if (!user) {
    return <Navigate to={redirectTo || "/"} replace />;
  }

  // Profile fetch failed after retries → show error with sign-out option
  if (profileError && !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <p className="text-sm text-gray-600">
          Could not load your account profile. This is usually a database
          permissions issue.
        </p>
        <p className="text-xs text-gray-400">
          Make sure the Supabase GRANT statements have been run, then refresh.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  // User is logged in but profile hasn't loaded yet → keep spinning
  if (requiredRole && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // User is logged in with wrong role → redirect to portal root
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
