import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Stethoscope,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Building2,
  Shield,
} from "lucide-react";

export default function GPAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await signIn({ email, password });
      // After signIn the AuthContext will fetch the profile.
      // Give it a moment to propagate — the ProtectedRoute will
      // handle the role check.
      navigate("/gp");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      {/* Back link */}
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
      >
        <ArrowLeft size={14} /> Back to Portal
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/20">
            <Building2 size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Digi<span className="text-accent">Doc</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">GP Office Portal</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-accent/5 p-3">
            <Shield size={16} className="text-accent" />
            <p className="text-xs text-gray-600">
              This portal is for authorised GP staff only. Contact your
              administrator for access credentials.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@riverside-medical.ie"
                  required
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent/90 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Sign In to GP Portal"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Protected by Supabase Auth · Row Level Security enabled
        </p>
      </div>
    </div>
  );
}
