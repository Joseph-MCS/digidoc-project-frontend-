import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getPractices } from "../../lib/database";
import {
  Stethoscope,
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Building2,
} from "lucide-react";

export default function PatientAuth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [practiceId, setPracticeId] = useState("");
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  /* Fetch available GP practices for the signup dropdown */
  useEffect(() => {
    getPractices()
      .then((data) => setPractices(data || []))
      .catch(() => setPractices([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn({ email, password });
        navigate("/patient");
      } else {
        if (!firstName || !lastName) {
          throw new Error("First and last name are required.");
        }
        if (!practiceId) {
          throw new Error("Please select your GP practice.");
        }
        await signUp({
          email,
          password,
          firstName,
          lastName,
          role: "patient",
          practiceId,
        });
        setSuccessMsg(
          "Account created! Check your email for a confirmation link, then sign in."
        );
        setMode("login");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      {/* Back to portal */}
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
            <Stethoscope size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Digi<span className="text-primary">Doc</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">Patient Portal</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Tab toggle */}
          <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                mode === "login"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                mode === "signup"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Success message */}
          {successMsg && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {successMsg}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name fields (signup only) */}
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    First Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Joseph"
                      className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Murphy"
                    className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
            )}

            {/* GP Practice (signup only) */}
            {mode === "signup" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Your GP Practice
                </label>
                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={practiceId}
                    onChange={(e) => setPracticeId(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-8 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">Select your GP practice…</option>
                    {practices.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.address ? ` — ${p.address}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {practices.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No practices available yet. Contact your GP office.
                  </p>
                )}
              </div>
            )}

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
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                  placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
                  required
                  minLength={6}
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
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to DigiDoc's Terms of Service &amp; Privacy
          Policy.
        </p>
      </div>
    </div>
  );
}
