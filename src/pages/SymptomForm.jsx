import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createSubmission } from "../lib/database";
import {
  ChevronRight,
  ChevronLeft,
  User,
  Calendar,
  ClipboardList,
  AlertTriangle,
  Send,
  Loader2,
} from "lucide-react";
import BodyModel from "../components/BodyModel";

/* ── Constants ── */
const BODY_AREAS = [
  "Head / Face",
  "Eyes",
  "Ears / Nose / Throat",
  "Chest / Lungs",
  "Heart / Cardiovascular",
  "Abdomen / Stomach",
  "Back / Spine",
  "Skin",
  "Arms / Hands",
  "Legs / Feet",
  "Urinary / Reproductive",
  "Mental Health",
  "General / Whole Body",
];

const COMMON_SYMPTOMS = {
  "Head / Face": ["Headache", "Dizziness", "Migraine", "Jaw pain"],
  Eyes: ["Blurred vision", "Eye pain", "Red eye", "Itchy eyes"],
  "Ears / Nose / Throat": [
    "Sore throat",
    "Earache",
    "Blocked nose",
    "Nosebleed",
    "Difficulty swallowing",
  ],
  "Chest / Lungs": [
    "Cough",
    "Shortness of breath",
    "Wheezing",
    "Chest tightness",
  ],
  "Heart / Cardiovascular": [
    "Chest pain",
    "Palpitations",
    "Swollen ankles",
    "High blood pressure",
  ],
  "Abdomen / Stomach": [
    "Nausea",
    "Vomiting",
    "Diarrhoea",
    "Constipation",
    "Stomach cramps",
    "Bloating",
  ],
  "Back / Spine": ["Lower back pain", "Upper back pain", "Neck pain", "Stiffness"],
  Skin: ["Rash", "Itching", "Swelling", "Bruising", "Wound"],
  "Arms / Hands": ["Joint pain", "Numbness", "Weakness", "Swelling"],
  "Legs / Feet": ["Leg pain", "Swollen legs", "Numbness", "Cramps"],
  "Urinary / Reproductive": [
    "Painful urination",
    "Frequent urination",
    "Blood in urine",
    "Pelvic pain",
  ],
  "Mental Health": [
    "Anxiety",
    "Low mood",
    "Insomnia",
    "Stress",
    "Fatigue",
  ],
  "General / Whole Body": [
    "Fever",
    "Fatigue",
    "Weight loss",
    "Night sweats",
    "Loss of appetite",
  ],
};

const DURATION_OPTIONS = [
  "Less than 24 hours",
  "1 – 3 days",
  "4 – 7 days",
  "1 – 2 weeks",
  "More than 2 weeks",
];

const SEVERITY_LEVELS = [
  { value: 1, label: "Mild", desc: "Noticeable but doesn't affect daily life", color: "bg-green-500" },
  { value: 2, label: "Moderate", desc: "Uncomfortable, affects some activities", color: "bg-yellow-500" },
  { value: 3, label: "Severe", desc: "Significant impact on daily life", color: "bg-orange-500" },
  { value: 4, label: "Very Severe", desc: "Barely able to carry on normally", color: "bg-red-500" },
];

const STEPS = [
  { label: "About You", icon: User },
  { label: "Symptoms", icon: ClipboardList },
  { label: "Details", icon: Calendar },
  { label: "Review", icon: Send },
];

/* ── Main Component ── */
export default function SymptomForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  /* Form state */
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    bodyAreas: [],
    selectedSymptoms: [],
    customSymptom: "",
    duration: "",
    severity: null,
    additionalInfo: "",
    agreeTerms: false,
  });

  /* Helpers */
  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target ? e.target.value : e }));

  const toggleBodyArea = (area) =>
    setForm((prev) => {
      const has = prev.bodyAreas.includes(area);
      const newAreas = has
        ? prev.bodyAreas.filter((a) => a !== area)
        : [...prev.bodyAreas, area];
      // When removing an area, also remove its associated symptoms
      const removedSymptoms = has
        ? (COMMON_SYMPTOMS[area] || [])
        : [];
      const newSymptoms = has
        ? prev.selectedSymptoms.filter((s) => !removedSymptoms.includes(s))
        : prev.selectedSymptoms;
      return { ...prev, bodyAreas: newAreas, selectedSymptoms: newSymptoms };
    });

  const toggleSymptom = (s) =>
    setForm((prev) => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(s)
        ? prev.selectedSymptoms.filter((x) => x !== s)
        : [...prev.selectedSymptoms, s],
    }));

  const addCustomSymptom = () => {
    const trimmed = form.customSymptom.trim();
    if (trimmed && !form.selectedSymptoms.includes(trimmed)) {
      setForm((prev) => ({
        ...prev,
        selectedSymptoms: [...prev.selectedSymptoms, trimmed],
        customSymptom: "",
      }));
    }
  };

  /* Validation per step */
  const canProceed = () => {
    switch (step) {
      case 0:
        return form.firstName && form.lastName && form.age && form.gender;
      case 1:
        return form.bodyAreas.length > 0 && form.selectedSymptoms.length > 0;
      case 2:
        return form.duration && form.severity;
      case 3:
        return form.agreeTerms;
      default:
        return false;
    }
  };

  /* Submit */
  const handleSubmit = async () => {
    setSubmitting(true);

    // Determine triage level based on severity + duration heuristic
    let level = "green"; // self-care
    if (form.severity >= 3 || form.duration === "More than 2 weeks") {
      level = "amber"; // GP consultation recommended
    }
    if (
      form.severity === 4 &&
      (form.duration === "Less than 24 hours" || form.duration === "1 – 3 days")
    ) {
      level = "red"; // urgent
    }

    try {
      // Persist to Supabase
      if (user) {
        await createSubmission({
          patientId: user.id,
          formData: form,
          triageLevel: level,
        });
      }
    } catch (err) {
      console.error("Failed to save submission:", err);
    }

    navigate("/patient/result", {
      state: {
        ...form,
        triageLevel: level,
      },
    });
  };

  /* ── Step Renderers ── */
  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepAboutYou form={form} set={set} />;
      case 1:
        return (
          <StepSymptoms
            form={form}
            setForm={setForm}
            toggleBodyArea={toggleBodyArea}
            toggleSymptom={toggleSymptom}
            addCustomSymptom={addCustomSymptom}
            set={set}
          />
        );
      case 2:
        return <StepDetails form={form} set={set} setForm={setForm} />;
      case 3:
        return <StepReview form={form} setForm={setForm} />;
      default:
        return null;
    }
  };

  return (
    <div className={`mx-auto px-4 py-10 sm:px-6 lg:px-8 ${step === 1 ? "max-w-6xl" : "max-w-3xl"}`}>
      {/* Progress stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.label} className="flex flex-1 flex-col items-center">
                <div className="relative flex items-center justify-center">
                  {i > 0 && (
                    <div
                      className={`absolute right-full mr-0 h-0.5 w-[calc(100%-8px)] ${
                        isDone ? "bg-primary" : "bg-gray-200"
                      }`}
                      style={{ width: "60px", right: "24px" }}
                    />
                  )}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                      isActive
                        ? "border-primary bg-primary text-white shadow-md shadow-primary/30"
                        : isDone
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 bg-white text-gray-400"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                </div>
                <span
                  className={`mt-2 hidden text-xs font-medium sm:block ${
                    isActive
                      ? "text-primary"
                      : isDone
                      ? "text-primary/70"
                      : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content card */}
      <div className="animate-fade-in-up rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || submitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Analysing…
              </>
            ) : (
              <>
                Submit Assessment <Send size={16} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Emergency banner */}
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-500" />
        <p className="text-sm text-red-700">
          <strong>If this is a medical emergency</strong>, please call{" "}
          <strong>999 / 112</strong> or go to your nearest A&amp;E immediately.
          DigiDoc is not a replacement for emergency services.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════ Sub-step components ═══════════════════ */

function StepAboutYou({ form, set }) {
  return (
    <>
      <h2 className="mb-1 text-xl font-bold text-gray-900">About You</h2>
      <p className="mb-6 text-sm text-gray-500">
        Basic information helps us tailor the assessment.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First Name" required>
          <input
            value={form.firstName}
            onChange={set("firstName")}
            placeholder="e.g. Aoife"
            className="input-field"
          />
        </Field>

        <Field label="Last Name" required>
          <input
            value={form.lastName}
            onChange={set("lastName")}
            placeholder="e.g. Murphy"
            className="input-field"
          />
        </Field>

        <Field label="Age" required>
          <input
            type="number"
            min="0"
            max="120"
            value={form.age}
            onChange={set("age")}
            placeholder="e.g. 34"
            className="input-field"
          />
        </Field>

        <Field label="Gender" required>
          <select value={form.gender} onChange={set("gender")} className="input-field">
            <option value="">Select…</option>
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </select>
        </Field>
      </div>
    </>
  );
}

function StepSymptoms({ form, setForm, toggleBodyArea, toggleSymptom, addCustomSymptom, set }) {
  // Gather suggestions for every selected area
  const allSuggestions = form.bodyAreas.flatMap((area) =>
    (COMMON_SYMPTOMS[area] || []).map((s) => ({ symptom: s, area }))
  );
  // Deduplicate by symptom name
  const seen = new Set();
  const uniqueSuggestions = allSuggestions.filter(({ symptom }) => {
    if (seen.has(symptom)) return false;
    seen.add(symptom);
    return true;
  });

  return (
    <>
      <h2 className="mb-1 text-xl font-bold text-gray-900">
        Where are you experiencing symptoms?
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Select one or more body areas, then choose all symptoms that apply.
      </p>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* LEFT: Body model + area list */}
        <div className="flex flex-col items-center gap-4 lg:w-[380px] lg:shrink-0">
          <BodyModel
            selectedAreas={form.bodyAreas}
            onToggleArea={toggleBodyArea}
            gender={form.gender}
          />

          <div className="w-full">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Or select from list
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BODY_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => toggleBodyArea(area)}
                  className={`rounded-xl border-2 px-3 py-2 text-left text-sm font-medium transition-all ${
                    form.bodyAreas.includes(area)
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Symptom selection */}
        <div className="min-w-0 flex-1">
          {form.bodyAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
              <ClipboardList className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">
                Select a body area to see related symptoms
              </p>
            </div>
          ) : (
            <>
              {/* Symptom suggestions grouped by area */}
              {form.bodyAreas.map((area) => {
                const areaSymptoms = COMMON_SYMPTOMS[area] || [];
                if (areaSymptoms.length === 0) return null;
                return (
                  <div key={area} className="mb-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {area}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {areaSymptoms.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleSymptom(s)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                            form.selectedSymptoms.includes(s)
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Custom symptom */}
              <div className="mt-4 flex gap-2">
                <input
                  value={form.customSymptom}
                  onChange={set("customSymptom")}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSymptom())}
                  placeholder="Add another symptom…"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={addCustomSymptom}
                  className="shrink-0 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Add
                </button>
              </div>

              {/* Selected pills */}
              {form.selectedSymptoms.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Selected ({form.selectedSymptoms.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.selectedSymptoms.map((s) => (
                      <span
                        key={s}
                        className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        {s}
                        <button
                          onClick={() => toggleSymptom(s)}
                          className="ml-1 text-primary/60 hover:text-primary"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function StepDetails({ form, set, setForm }) {
  return (
    <>
      <h2 className="mb-1 text-xl font-bold text-gray-900">
        Symptom Details
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Help us understand the severity and duration.
      </p>

      {/* Duration */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          How long have you had these symptoms? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setForm((prev) => ({ ...prev, duration: d }))}
              className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                form.duration === d
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Severity */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          How would you rate the severity? <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {SEVERITY_LEVELS.map((s) => (
            <button
              key={s.value}
              onClick={() => setForm((prev) => ({ ...prev, severity: s.value }))}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                form.severity === s.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`h-3 w-3 rounded-full ${s.color}`} />
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Additional info */}
      <Field label="Anything else you'd like us to know?">
        <textarea
          rows={3}
          value={form.additionalInfo}
          onChange={set("additionalInfo")}
          placeholder="e.g. current medications, allergies, relevant medical history…"
          className="input-field resize-none"
        />
      </Field>
    </>
  );
}

function StepReview({ form, setForm }) {
  return (
    <>
      <h2 className="mb-1 text-xl font-bold text-gray-900">Review &amp; Submit</h2>
      <p className="mb-6 text-sm text-gray-500">
        Please review the information below before submitting.
      </p>

      <div className="space-y-4">
        <ReviewRow label="Name" value={`${form.firstName} ${form.lastName}`} />
        <ReviewRow label="Age / Gender" value={`${form.age} – ${form.gender}`} />
        <ReviewRow label="Body Areas" value={form.bodyAreas.join(", ")} />
        <ReviewRow label="Symptoms" value={form.selectedSymptoms.join(", ")} />
        <ReviewRow label="Duration" value={form.duration} />
        <ReviewRow
          label="Severity"
          value={SEVERITY_LEVELS.find((s) => s.value === form.severity)?.label}
        />
        {form.additionalInfo && (
          <ReviewRow label="Additional Info" value={form.additionalInfo} />
        )}
      </div>

      {/* Terms */}
      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={form.agreeTerms}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, agreeTerms: e.target.checked }))
          }
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className="text-sm text-gray-600">
          I understand that DigiDoc provides guidance only and is{" "}
          <strong>not a substitute</strong> for professional medical advice,
          diagnosis, or treatment.
        </span>
      </label>
    </>
  );
}

/* ── Shared helpers ── */

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      <style>{`
        .input-field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #1e293b;
          background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .input-field:focus {
          border-color: #0D9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }
        .input-field::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-3 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-32 shrink-0 text-sm font-semibold text-gray-500">
        {label}
      </span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}
