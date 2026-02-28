import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  Sparkles,
  Loader2,
  User,
  Search,
} from "lucide-react";
import { PATIENTS, AI_ANALYSES } from "../../data/mockPatients";

export default function AIAssistant() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = PATIENTS.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const runAnalysis = (patient) => {
    setSelectedPatient(patient);
    setAnalysis(null);
    setLoading(true);
    setTimeout(() => {
      setAnalysis(AI_ANALYSES[patient.id] || null);
      setLoading(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BrainCircuit size={24} className="text-accent" />
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Select a patient to run an AI-powered clinical analysis using their
          reported symptoms and complete medical history.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Patient selector */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patients…"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="max-h-[500px] divide-y divide-gray-50 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => runAnalysis(p)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                    selectedPatient?.id === p.id ? "bg-accent/5" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      p.triageLevel === "red"
                        ? "bg-red-100 text-red-700"
                        : p.triageLevel === "amber"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {p.firstName[0]}
                    {p.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {p.bodyArea} · {p.selectedSymptoms[0]}
                    </p>
                  </div>
                  <TriageDot level={p.triageLevel} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis panel */}
        <div className="lg:col-span-3">
          {!selectedPatient ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
              <BrainCircuit size={48} className="mb-4 text-gray-200" />
              <h3 className="mb-1 text-lg font-bold text-gray-700">
                Select a Patient
              </h3>
              <p className="text-sm text-gray-500">
                Choose a patient from the list to run an AI-assisted clinical analysis.
              </p>
            </div>
          ) : loading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-white p-10 text-center">
              <Loader2 size={40} className="mb-4 animate-spin text-accent" />
              <h3 className="mb-1 text-lg font-bold text-gray-900">
                Analysing {selectedPatient.firstName}'s Records…
              </h3>
              <p className="text-sm text-gray-500">
                Cross-referencing symptoms, medical history, medications, and
                risk factors
              </p>
              <div className="mt-4 flex gap-2">
                {["Symptoms", "Medications", "History", "Risk Factors"].map(
                  (s) => (
                    <span
                      key={s}
                      className="animate-pulse rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                    >
                      {s}
                    </span>
                  )
                )}
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {/* Patient header */}
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      selectedPatient.triageLevel === "red"
                        ? "bg-red-100 text-red-700"
                        : selectedPatient.triageLevel === "amber"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedPatient.firstName[0]}
                    {selectedPatient.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedPatient.age}y · {selectedPatient.gender} ·{" "}
                      {selectedPatient.id}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/gp/patients/${selectedPatient.id}`}
                  className="text-xs font-medium text-primary hover:text-primary-dark"
                >
                  View Full Record →
                </Link>
              </div>

              {/* AI result card */}
              <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" />
                  <h2 className="text-sm font-bold text-accent">
                    AI Clinical Analysis
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* Summary */}
                  <Section title="Clinical Summary">
                    <p className="text-sm leading-relaxed text-gray-700">
                      {analysis.summary}
                    </p>
                  </Section>

                  {/* Risk factors */}
                  <Section title="Risk Factors" titleColor="text-red-500">
                    <ul className="space-y-2">
                      {analysis.riskFactors.map((rf, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                          {rf}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  {/* Differential */}
                  <Section title="Differential Diagnosis">
                    <div className="space-y-2">
                      {analysis.differentialDiagnosis.map((dd, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm"
                        >
                          <span className="font-medium text-gray-900">
                            {dd.condition}
                          </span>
                          <LikelihoodBadge likelihood={dd.likelihood} />
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Recommendation */}
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                    <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-accent">
                      Recommendation
                    </h4>
                    <p className="text-sm leading-relaxed text-gray-800">
                      {analysis.recommendation}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      {analysis.urgency}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 italic">
                    AI-generated analysis for clinical decision support. All
                    decisions remain the responsibility of the treating
                    physician.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-sm text-gray-500">
                No analysis data available for this patient.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function Section({ title, titleColor = "text-accent", children }) {
  return (
    <div>
      <h4
        className={`mb-2 text-xs font-bold uppercase tracking-wide ${titleColor}`}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function TriageDot({ level }) {
  const color = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };
  return <div className={`h-2.5 w-2.5 rounded-full ${color[level]}`} />;
}

function LikelihoodBadge({ likelihood }) {
  const style =
    likelihood === "High" || likelihood === "Requires exclusion"
      ? "bg-red-100 text-red-700"
      : likelihood.includes("Moderate")
      ? "bg-amber-100 text-amber-700"
      : "bg-gray-100 text-gray-600";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {likelihood}
    </span>
  );
}
