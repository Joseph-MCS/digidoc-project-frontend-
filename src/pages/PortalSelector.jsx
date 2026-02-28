import { Link } from "react-router-dom";
import {
  Stethoscope,
  User,
  Building2,
  ArrowRight,
  Shield,
  Activity,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function PortalSelector() {
  const { user, profile } = useAuth();

  // If already logged in, show direct links
  const patientLink =
    user && profile?.role === "patient" ? "/patient" : "/auth/patient";
  const gpLink =
    user && profile?.role === "gp" ? "/gp" : "/auth/gp";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
          <Stethoscope size={32} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Digi<span className="text-primary">Doc</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Digital Healthcare Triage Platform
        </p>
      </div>

      {/* Portal cards */}
      <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
        {/* Patient portal */}
        <Link
          to={patientLink}
          className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-7 shadow-sm transition-all hover:border-primary hover:shadow-lg"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <User size={26} />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-900">
            Patient Portal
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-gray-500">
            Submit your symptoms for assessment. Get a triage recommendation and
            have your case reviewed by a licensed doctor.
          </p>
          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
            Enter as Patient <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </div>

          {/* Decorative dot */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-all group-hover:bg-primary/10" />
        </Link>

        {/* GP Office portal */}
        <Link
          to={gpLink}
          className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-7 shadow-sm transition-all hover:border-accent hover:shadow-lg"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
            <Building2 size={26} />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-900">
            GP Office Portal
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-gray-500">
            Review patient submissions, access medical histories, and use
            AI-assisted analysis to triage cases efficiently.
          </p>
          <div className="flex items-center gap-1 text-sm font-semibold text-accent">
            Enter as GP / Staff <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </div>

          {/* Decorative dot */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/5 transition-all group-hover:bg-accent/10" />
        </Link>
      </div>

      {/* Footer note */}
      <div className="mt-10 flex items-center gap-2 text-xs text-gray-400">
        <Shield size={12} />
        <span>Secure · GDPR Compliant · Ireland</span>
      </div>
    </div>
  );
}
