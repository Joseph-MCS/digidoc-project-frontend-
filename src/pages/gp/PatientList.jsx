import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { getAllSubmissions } from "../../lib/database";
import { PATIENTS } from "../../data/mockPatients";

export default function PatientList() {
  const [search, setSearch] = useState("");
  const [filterTriage, setFilterTriage] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const subs = await getAllSubmissions();
        setSubmissions(subs);
      } catch {
        // Fallback to mock
        setSubmissions(
          PATIENTS.map((p) => ({
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
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = submissions.filter((p) => {
    const matchesSearch =
      `${p.first_name} ${p.last_name} ${p.id}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesTriage =
      filterTriage === "all" || p.triage_level === filterTriage;
    const matchesStatus =
      filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesTriage && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-sm text-gray-500">
          {submissions.length} total submissions · {submissions.filter((p) => p.status === "pending-review").length} pending review
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterTriage}
            onChange={(e) => setFilterTriage(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary"
          >
            <option value="all">All Triage</option>
            <option value="red">Urgent</option>
            <option value="amber">GP Review</option>
            <option value="green">Self-care</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="pending-review">Pending</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      {/* Patient cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No patients match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/gp/patients/${p.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    p.triage_level === "red"
                      ? "bg-red-100 text-red-700"
                      : p.triage_level === "amber"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {(p.first_name || "?")[0]}
                  {(p.last_name || "?")[0]}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      {p.first_name} {p.last_name}
                    </p>
                    <span className="text-xs text-gray-400">{p.id.slice(0, 8)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {p.age}y · {p.gender} · {(p.body_areas || []).join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {(p.selected_symptoms || []).slice(0, 3).join(", ")}
                    {(p.selected_symptoms || []).length > 3 && (
                      <span className="text-gray-400">
                        {" "}
                        +{p.selected_symptoms.length - 3} more
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex flex-col items-end gap-1">
                  <TriageBadge level={p.triage_level} />
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleString("en-IE", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    Severity: {["", "Mild", "Moderate", "Severe", "Very Severe"][p.severity]}
                  </p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
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
