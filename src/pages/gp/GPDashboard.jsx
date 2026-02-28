import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity,
  TrendingUp,
  BrainCircuit,
  Loader2,
} from "lucide-react";
import { getAllSubmissions } from "../../lib/database";
import { useAuth } from "../../contexts/AuthContext";
import { PATIENTS } from "../../data/mockPatients";

export default function GPDashboard() {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const subs = await getAllSubmissions();
        setSubmissions(subs);
      } catch {
        // Fallback to mock data if Supabase isn't configured
        setUseMock(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // Data source – Supabase or mock fallback
  const data = useMock
    ? PATIENTS.map((p) => ({
        id: p.id,
        first_name: p.firstName,
        last_name: p.lastName,
        age: p.age,
        gender: p.gender,
        body_areas: p.bodyAreas || [p.bodyArea],
        selected_symptoms: p.selectedSymptoms,
        triage_level: p.triageLevel,
        status: p.status,
        severity: p.severity,
        created_at: p.submittedAt,
      }))
    : submissions;

  const pending = data.filter((p) => p.status === "pending-review");
  const reviewed = data.filter((p) => p.status === "reviewed");
  const urgent = data.filter((p) => p.triage_level === "red");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {profile?.owned_practices?.[0]?.name
            ? `${profile.owned_practices[0].name} — `
            : ""}
          Overview of patient submissions and triage status
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Submissions"
          value={data.length}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={pending.length}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Urgent Cases"
          value={urgent.length}
          color="bg-red-50 text-red-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Reviewed"
          value={reviewed.length}
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/gp/patients"
          className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">View All Patients</p>
            <p className="text-xs text-gray-500">
              Review and manage submissions
            </p>
          </div>
          <ArrowRight size={16} className="text-gray-400" />
        </Link>

        <Link
          to="/gp/ai-assistant"
          className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <BrainCircuit size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">AI Assistant</p>
            <p className="text-xs text-gray-500">
              Analyse patient history with AI
            </p>
          </div>
          <ArrowRight size={16} className="text-gray-400" />
        </Link>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <TrendingUp size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">Triage Efficiency</p>
            <p className="text-xs text-gray-500">
              {data.length > 0
                ? `${Math.round((reviewed.length / data.length) * 100)}% reviewed today`
                : "No submissions yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Urgent cases */}
      {urgent.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="text-sm font-bold text-red-800">
              Urgent Cases Requiring Immediate Attention
            </h2>
          </div>
          <div className="space-y-3">
            {urgent.map((p) => (
              <Link
                key={p.id}
                to={`/gp/patients/${p.id}`}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                    {(p.first_name || "?")[0]}
                    {(p.last_name || "?")[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {p.first_name} {p.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(p.body_areas || []).join(", ")} · {(p.selected_symptoms || []).slice(0, 2).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Urgent
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent submissions */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Recent Submissions
          </h2>
          <Link
            to="/gp/patients"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left font-semibold text-gray-600">
                  Patient
                </th>
                <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 sm:table-cell">
                  Body Area
                </th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">
                  Triage
                </th>
                <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 md:table-cell">
                  Submitted
                </th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-3">
                    <Link
                      to={`/gp/patients/${p.id}`}
                      className="font-medium text-gray-900 hover:text-primary"
                    >
                      {p.first_name} {p.last_name}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {p.age}y · {p.gender}
                    </p>
                  </td>
                  <td className="hidden px-5 py-3 text-gray-600 sm:table-cell">
                    {(p.body_areas || []).join(", ")}
                  </td>
                  <td className="px-5 py-3">
                    <TriageBadge level={p.triage_level} />
                  </td>
                  <td className="hidden px-5 py-3 text-gray-500 md:table-cell">
                    {new Date(p.created_at).toLocaleString("en-IE", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
        >
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function TriageBadge({ level }) {
  const styles = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  const labels = { green: "Self-care", amber: "GP Review", red: "Urgent" };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${styles[level]}`}
    >
      {labels[level]}
    </span>
  );
}

function StatusBadge({ status }) {
  if (status === "reviewed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
        <CheckCircle size={12} /> Reviewed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
      <Clock size={12} /> Pending
    </span>
  );
}
