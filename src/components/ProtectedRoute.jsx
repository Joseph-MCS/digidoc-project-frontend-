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
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to={redirectTo || "/"} replace />;
  }

  // Wrong role
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
