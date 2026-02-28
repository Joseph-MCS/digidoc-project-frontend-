import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Pill,
  AlertTriangle,
  Heart,
  FileText,
  BrainCircuit,
  Loader2,
  Sparkles,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Send,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getSubmission,
  getSubmissionActions,
  createGPAction,
  updateSubmissionStatus,
} from "../../lib/database";
import { PATIENTS, AI_ANALYSES } from "../../data/mockPatients";

export default function PatientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  // AI panel state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [activeTab, setActiveTab] = useState("current");

  // GP action form
  const [actionType, setActionType] = useState("note");
  const [actionNotes, setActionNotes] = useState("");
  const [actionSaving, setActionSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [sub, acts] = await Promise.all([
          getSubmission(id),
          getSubmissionActions(id),
        ]);
        setSubmission(sub);
        setActions(acts);
      } catch {
        // Fallback to mock data
        const mock = PATIENTS.find((p) => p.id === id);
        if (mock) {
          setSubmission({
            id: mock.id,
            first_name: mock.firstName,
            last_name: mock.lastName,
            age: mock.age,
            gender: mock.gender,
            body_areas: mock.bodyAreas || [mock.bodyArea],
            selected_symptoms: mock.selectedSymptoms,
            duration: mock.duration,
            severity: mock.severity,
            additional_info: mock.additionalInfo,
            triage_level: mock.triageLevel,
            status: mock.status,
            created_at: mock.submittedAt,
            profiles: {
              first_name: mock.firstName,
              last_name: mock.lastName,
              email: mock.email,
              phone: mock.phone,
            },
            _mock: true,
            _medicalHistory: mock.medicalHistory,
          });
          setUseMock(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <User size={48} className="mb-4 text-gray-300" />
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          Submission Not Found
        </h2>
        <Link
          to="/gp/patients"
          className="mt-4 text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Back to Patients
        </Link>
      </div>
    );
  }

  const s = submission;
  const severityLabel = ["", "Mild", "Moderate", "Severe", "Very Severe"][s.severity];
  const severityColor = [
    "",
    "text-green-600 bg-green-50",
    "text-yellow-600 bg-yellow-50",
    "text-orange-600 bg-orange-50",
    "text-red-600 bg-red-50",
  ][s.severity];

  const runAiAnalysis = () => {
    setAiOpen(true);
    setAiLoading(true);
    setTimeout(() => {
      setAiResult(AI_ANALYSES[s.id] || generateGenericAnalysis(s));
      setAiLoading(false);
    }, 2500);
  };

  const handleAddAction = async () => {
    if (!actionNotes.trim()) return;
    setActionSaving(true);
    try {
      const newAction = await createGPAction({
        submissionId: s.id,
        gpId: user.id,
        actionType,
        notes: actionNotes.trim(),
      });
      setActions((prev) => [newAction, ...prev]);
      setActionNotes("");

      // Auto-mark as reviewed if it's a review action
      if (actionType === "review" && s.status === "pending-review") {
        await updateSubmissionStatus(s.id, "reviewed");
        setSubmission((prev) => ({ ...prev, status: "reviewed" }));
      }
    } catch (err) {
      console.error("Failed to save action:", err);
    } finally {
      setActionSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/gp/patients"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={14} /> Back to Patients
      </Link>

      {/* Patient header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold ${
              s.triage_level === "red"
                ? "bg-red-100 text-red-700"
                : s.triage_level === "amber"
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {(s.first_name || "?")[0]}
            {(s.last_name || "?")[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {s.first_name} {s.last_name}
            </h1>
            <p className="text-sm text-gray-500">
              {s.age}y · {s.gender} · {s.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <TriageBadge level={s.triage_level} />
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${severityColor}`}
          >
            Severity: {severityLabel}
          </span>
          {s.status === "reviewed" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              <CheckCircle size={12} /> Reviewed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              <Clock size={12} /> Pending Review
            </span>
          )}
        </div>
      </div>

      {/* AI Analysis button */}
      {!aiOpen && (
        <button
          onClick={runAiAnalysis}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-accent/30 bg-accent/5 p-5 text-sm font-semibold text-accent transition-all hover:border-accent/50 hover:bg-accent/10"
        >
          <BrainCircuit size={20} />
          Run AI-Assisted Analysis
          <Sparkles size={14} />
        </button>
      )}

      {/* AI Analysis panel */}
      {aiOpen && (
        <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <BrainCircuit size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                AI Clinical Analysis
              </h2>
              <p className="text-xs text-gray-500">
                LLM-powered assessment using symptom history &amp; medical records
              </p>
            </div>
          </div>

          {aiLoading ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2
                size={32}
                className="animate-spin text-accent"
              />
              <p className="text-sm font-medium text-gray-600">
                Analysing patient history and reported symptoms…
              </p>
              <p className="text-xs text-gray-400">
                Cross-referencing medical records, medications, and risk factors
              </p>
            </div>
          ) : aiResult ? (
            <div className="space-y-5">
              {/* Summary */}
              <div>
                <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-accent">
                  Clinical Summary
                </h3>
                <p className="text-sm leading-relaxed text-gray-700">
                  {aiResult.summary}
                </p>
              </div>

              {/* Risk factors */}
              <div>
                <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-red-500">
                  Risk Factors Identified
                </h3>
                <ul className="space-y-1.5">
                  {aiResult.riskFactors.map((rf, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <AlertTriangle
                        size={14}
                        className="mt-0.5 shrink-0 text-red-400"
                      />
                      {rf}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Differential diagnosis */}
              <div>
                <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-accent">
                  Differential Diagnosis
                </h3>
                <div className="space-y-2">
                  {aiResult.differentialDiagnosis.map((dd, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-white/80 px-4 py-2.5 text-sm"
                    >
                      <span className="font-medium text-gray-900">
                        {dd.condition}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          dd.likelihood === "High" ||
                          dd.likelihood === "Requires exclusion"
                            ? "bg-red-100 text-red-700"
                            : dd.likelihood.includes("Moderate")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {dd.likelihood}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-accent">
                  AI Recommendation
                </h3>
                <p className="text-sm leading-relaxed text-gray-800">
                  {aiResult.recommendation}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  <Activity size={12} />
                  {aiResult.urgency}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 italic">
                This AI analysis is a decision-support tool only. All clinical
                decisions remain the responsibility of the treating physician.
              </p>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              No analysis available for this patient.
            </p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {[
            { key: "current", label: "Current Submission" },
            { key: "history", label: "Medical History" },
            { key: "visits", label: "Previous Visits" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "current" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Submission details */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <FileText size={16} className="text-primary" />
              Submission Details
            </h2>
            <div className="space-y-3">
              <DetailRow label="Body Areas" value={(s.body_areas || []).join(", ")} />
              <DetailRow
                label="Symptoms"
                value={(s.selected_symptoms || []).join(", ")}
              />
              <DetailRow label="Duration" value={s.duration} />
              <DetailRow label="Severity" value={severityLabel} />
              <DetailRow
                label="Submitted"
                value={new Date(s.created_at).toLocaleString("en-IE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              />
              {s.additional_info && (
                <div className="pt-2">
                  <p className="mb-1 text-xs font-semibold text-gray-500">
                    Additional Notes
                  </p>
                  <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                    {s.additional_info}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <User size={16} className="text-primary" />
              Patient Information
            </h2>
            <div className="space-y-3">
              <DetailRow
                label="Full Name"
                value={`${s.first_name} ${s.last_name}`}
              />
              <DetailRow label="Age" value={`${s.age} years`} />
              <DetailRow label="Gender" value={s.gender} />
              {s.profiles?.phone && <DetailRow label="Phone" value={s.profiles.phone} />}
              {s.profiles?.email && <DetailRow label="Email" value={s.profiles.email} />}
            </div>
          </div>

          {/* GP Actions panel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <Activity size={16} className="text-primary" />
              GP Actions
            </h2>

            {/* Add action form */}
            <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="review">Review</option>
                  <option value="note">Note</option>
                  <option value="prescribe">Prescription</option>
                  <option value="refer">Referral</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="discharge">Discharge</option>
                </select>
                <input
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddAction()}
                  placeholder="Add notes..."
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddAction}
                  disabled={actionSaving || !actionNotes.trim()}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {actionSaving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Save
                </button>
              </div>
            </div>

            {/* Action history */}
            {actions.length > 0 ? (
              <div className="space-y-2">
                {actions.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                    <ActionBadge type={a.action_type} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{a.notes}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {a.profiles ? `${a.profiles.first_name} ${a.profiles.last_name}` : "GP"} ·{" "}
                        {new Date(a.created_at).toLocaleString("en-IE", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No actions recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <>
          {s._medicalHistory ? (
            (() => {
              const mh = s._medicalHistory;
              return (
                <div className="grid gap-6 lg:grid-cols-2">
                  <InfoCard title="Conditions" icon={Heart}>
                    {mh.conditions.length > 0 ? (
                      <ul className="space-y-2">
                        {mh.conditions.map((c, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">No known conditions</p>
                    )}
                  </InfoCard>

                  <InfoCard title="Current Medications" icon={Pill}>
                    {mh.medications.length > 0 ? (
                      <ul className="space-y-2">
                        {mh.medications.map((m, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <Pill size={12} className="shrink-0 text-primary" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">No current medications</p>
                    )}
                  </InfoCard>

                  <InfoCard title="Allergies" icon={AlertTriangle}>
                    {mh.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {mh.allergies.map((a, i) => (
                          <span key={i} className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No known allergies (NKDA)</p>
                    )}
                  </InfoCard>

                  <InfoCard title="Family History" icon={User}>
                    {mh.familyHistory.length > 0 ? (
                      <ul className="space-y-2">
                        {mh.familyHistory.map((f, i) => (
                          <li key={i} className="text-sm text-gray-700">{f}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">No significant family history</p>
                    )}
                  </InfoCard>

                  <InfoCard title="Lifestyle" icon={Activity} className="lg:col-span-2">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Smoking</p>
                        <p className="text-sm text-gray-900">{mh.smoking}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Alcohol</p>
                        <p className="text-sm text-gray-900">{mh.alcohol}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Surgeries</p>
                        <p className="text-sm text-gray-900">
                          {mh.surgeries.length > 0 ? mh.surgeries.join(", ") : "None"}
                        </p>
                      </div>
                    </div>
                  </InfoCard>
                </div>
              );
            })()
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-sm text-gray-400">
                Medical history will be available once integrated with the patient's full health record.
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === "visits" && (
        <div className="space-y-3">
          {s._medicalHistory?.previousVisits?.length > 0 ? (
            s._medicalHistory.previousVisits.map((v, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {v.reason}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{v.outcome}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500">
                      {new Date(v.date).toLocaleDateString("en-IE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400">{v.doctor}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-sm text-gray-400">No previous visits on record.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-28 shrink-0 text-xs font-semibold text-gray-500">
        {label}
      </span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

function InfoCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
        <Icon size={16} className="text-primary" />
        {title}
      </h2>
      {children}
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
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[level]}`}
    >
      {labels[level]}
    </span>
  );
}

function ActionBadge({ type }) {
  const config = {
    review: { label: "Review", color: "bg-green-100 text-green-700" },
    note: { label: "Note", color: "bg-blue-100 text-blue-700" },
    prescribe: { label: "Rx", color: "bg-purple-100 text-purple-700" },
    refer: { label: "Referral", color: "bg-amber-100 text-amber-700" },
    "follow-up": { label: "Follow-up", color: "bg-cyan-100 text-cyan-700" },
    discharge: { label: "Discharge", color: "bg-gray-100 text-gray-700" },
  };
  const c = config[type] || config.note;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${c.color}`}>
      {c.label}
    </span>
  );
}

function generateGenericAnalysis(submission) {
  return {
    summary: `Patient presents with ${(submission.selected_symptoms || []).join(", ")} in the ${(submission.body_areas || []).join(", ")} area(s). Duration: ${submission.duration}. Severity rated ${submission.severity}/4.`,
    riskFactors: [
      `Severity level ${submission.severity}/4 warrants clinical attention`,
      `Duration of ${submission.duration} noted`,
    ],
    differentialDiagnosis: [
      { condition: "Requires clinical evaluation", likelihood: "Moderate" },
    ],
    recommendation:
      "A clinical assessment is recommended to determine appropriate diagnosis and treatment plan.",
    urgency:
      submission.triage_level === "red"
        ? "Urgent – prioritise"
        : submission.triage_level === "amber"
        ? "Semi-urgent – schedule within 48 hours"
        : "Routine – standard follow-up",
  };
}
