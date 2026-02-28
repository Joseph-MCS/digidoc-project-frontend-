import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Mail,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
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
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <KeyRound size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Digi<span className="text-primary">Doc</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">Reset your password</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                Check your email
              </h2>
              <p className="mb-6 text-sm text-gray-500">
                We've sent a password reset link to{" "}
                <span className="font-medium text-gray-700">{email}</span>.
                Click the link in the email to set a new password.
              </p>
              <p className="mb-4 text-xs text-gray-400">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Send again
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              <p className="mb-6 text-sm text-gray-500">
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </p>

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
                      placeholder="you@example.ie"
                      required
                      className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer links */}
        <div className="mt-6 flex justify-center gap-4 text-xs text-gray-400">
          <Link
            to="/auth/patient"
            className="hover:text-primary"
          >
            Patient Sign In
          </Link>
          <span>·</span>
          <Link
            to="/auth/gp"
            className="hover:text-accent"
          >
            GP Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
