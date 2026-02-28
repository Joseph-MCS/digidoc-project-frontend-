import { useLocation, Link } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Phone,
  Clock,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

const TRIAGE = {
  green: {
    icon: CheckCircle,
    title: "Self-Care Recommended",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    description:
      "Based on your symptoms, this does not appear to require urgent medical attention. You can likely manage this at home with self-care.",
    actions: [
      "Rest and stay hydrated",
      "Use over-the-counter medication if appropriate",
      "Monitor your symptoms over the next 48 hours",
      "Contact your GP if symptoms worsen or persist beyond a week",
    ],
  },
  amber: {
    icon: AlertTriangle,
    title: "GP Consultation Recommended",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    description:
      "Your symptoms suggest you should see a GP at your earliest convenience. This is not an emergency, but professional evaluation is advisable.",
    actions: [
      "Book an appointment with your GP this week",
      "Note down any changes in your symptoms",
      "Bring a list of current medications to your appointment",
      "If symptoms worsen significantly, consider attending an urgent care centre",
    ],
  },
  red: {
    icon: XCircle,
    title: "Urgent Care Advised",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    description:
      "Your symptoms indicate you should seek prompt medical attention. Please contact your GP urgently or attend an urgent care centre / A&E today.",
    actions: [
      "Contact your GP for an urgent appointment",
      "If unavailable, attend your nearest urgent care centre",
      "For life-threatening symptoms, call 999 / 112 immediately",
      "Do not drive yourself if you feel unwell – ask someone to take you",
    ],
  },
};

export default function TriageResult() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Stethoscope size={48} className="mb-4 text-gray-300" />
        <h2 className="mb-2 text-xl font-bold text-gray-900">No Assessment Found</h2>
        <p className="mb-6 text-sm text-gray-500">
          It looks like you haven't submitted a symptom assessment yet.
        </p>
        <Link
          to="/patient/symptoms"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Start Assessment
        </Link>
      </div>
    );
  }

  const t = TRIAGE[state.triageLevel] || TRIAGE.green;
  const Icon = t.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Badge */}
      <div className="animate-fade-in-up mb-8 text-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${t.badge}`}
        >
          <ShieldCheck size={14} /> Assessment Complete
        </span>
      </div>

      {/* Main result card */}
      <div
        className={`animate-fade-in-up-delay rounded-2xl border ${t.border} ${t.bg} p-6 text-center sm:p-8`}
      >
        <Icon size={56} className={`mx-auto mb-4 ${t.color}`} />
        <h1 className={`mb-3 text-2xl font-bold ${t.color}`}>{t.title}</h1>
        <p className="mx-auto max-w-md text-sm text-gray-700 leading-relaxed">
          {t.description}
        </p>
      </div>

      {/* Summary */}
      <div className="animate-fade-in-up-delay mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Your Summary</h2>
        <div className="space-y-3 text-sm">
          <SummaryRow label="Patient" value={`${state.firstName} ${state.lastName}`} />
          <SummaryRow label="Age / Gender" value={`${state.age} – ${state.gender}`} />
          <SummaryRow label="Body Areas" value={Array.isArray(state.bodyAreas) ? state.bodyAreas.join(", ") : state.bodyAreas} />
          <SummaryRow label="Symptoms" value={state.selectedSymptoms?.join(", ")} />
          <SummaryRow label="Duration" value={state.duration} />
          <SummaryRow
            label="Severity"
            value={
              ["", "Mild", "Moderate", "Severe", "Very Severe"][state.severity]
            }
          />
          {state.additionalInfo && (
            <SummaryRow label="Notes" value={state.additionalInfo} />
          )}
        </div>
      </div>

      {/* Recommended actions */}
      <div className="animate-fade-in-up-delay-2 mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Recommended Next Steps
        </h2>
        <ul className="space-y-3">
          {t.actions.map((a, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </div>
              <span className="text-sm text-gray-700">{a}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Clock size={18} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Please note:</strong> This assessment is generated by an AI
          triage system and will be reviewed by a licensed doctor. You will
          receive a follow-up within <strong>24 hours</strong>. This is guidance
          only and does not replace professional medical advice.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/patient/symptoms"
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={16} /> New Assessment
        </Link>
        <a
          href="tel:999"
          className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
        >
          <Phone size={16} /> Call Emergency Services
        </a>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-100 pb-2 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-28 shrink-0 font-semibold text-gray-500">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
