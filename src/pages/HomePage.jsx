import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Shield,
  Clock,
  Stethoscope,
  Activity,
  Users,
  CheckCircle,
  Building2,
  MapPin,
  CalendarCheck,
  X,
  RefreshCw,
  Loader2,
  Calendar,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getPatientAppointments, updateAppointment } from "../lib/database";

export default function HomePage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [aptsLoading, setAptsLoading] = useState(false);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    setAptsLoading(true);
    getPatientAppointments(user.id)
      .then((rows) => setAppointments(rows))
      .catch(() => {})
      .finally(() => setAptsLoading(false));
  }, [user?.id]);

  const handleCancel = async (id) => {
    setSavingId(id);
    try {
      await updateAppointment(id, { status: "cancelled" });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleReschedule = async (id) => {
    if (!rescheduleForm.date || !rescheduleForm.time) return;
    setSavingId(id);
    try {
      const updated = await updateAppointment(id, {
        appointmentDate: rescheduleForm.date,
        appointmentTime: rescheduleForm.time,
      });
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, appointment_date: updated.appointment_date, appointment_time: updated.appointment_time, status: updated.status }
            : a
        )
      );
      setReschedulingId(null);
      setRescheduleForm({ date: "", time: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const upcoming = appointments.filter((a) => a.status !== "cancelled");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  return (
    <>
      {/* ── Patient Appointments Dashboard ── */}
      {user && (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Your Hospital Appointments
              </h2>
              <p className="text-xs text-gray-500">
                Booked by your GP — you can cancel or reschedule below
              </p>
            </div>
          </div>

          {aptsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
              <Calendar size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">No upcoming hospital appointments.</p>
              <p className="mt-1 text-xs text-gray-400">
                When your GP books a hospital referral, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <div
                  key={apt.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Hospital info */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{apt.hospital}</p>
                        {(apt.department || apt.doctor) && (
                          <p className="text-xs text-gray-500">
                            {[apt.department, apt.doctor].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {apt.reason && (
                          <p className="mt-1 text-xs text-gray-400 italic">{apt.reason}</p>
                        )}
                      </div>
                    </div>

                    {/* Date / time / status */}
                    <div className="flex items-center gap-4 pl-12 sm:pl-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(apt.appointment_date).toLocaleDateString("en-IE", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-500">{apt.appointment_time}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          apt.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {apt.status === "confirmed" ? "Confirmed" : apt.status}
                      </span>
                    </div>
                  </div>

                  {/* Reschedule inline form */}
                  {reschedulingId === apt.id && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                      <p className="mb-3 text-xs font-semibold text-gray-600">
                        Choose a new date and time:
                      </p>
                      <div className="flex flex-wrap items-end gap-3">
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">New Date</label>
                          <input
                            type="date"
                            value={rescheduleForm.date}
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={(e) =>
                              setRescheduleForm((f) => ({ ...f, date: e.target.value }))
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">New Time</label>
                          <input
                            type="time"
                            value={rescheduleForm.time}
                            onChange={(e) =>
                              setRescheduleForm((f) => ({ ...f, time: e.target.value }))
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                          />
                        </div>
                        <button
                          onClick={() => handleReschedule(apt.id)}
                          disabled={
                            savingId === apt.id ||
                            !rescheduleForm.date ||
                            !rescheduleForm.time
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          {savingId === apt.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle size={13} />
                          )}
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setReschedulingId(null);
                            setRescheduleForm({ date: "", time: "" });
                          }}
                          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {reschedulingId !== apt.id && (
                    <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
                      <button
                        onClick={() => {
                          setReschedulingId(apt.id);
                          setRescheduleForm({ date: "", time: "" });
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-primary hover:text-primary"
                      >
                        <RefreshCw size={12} />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(apt.id)}
                        disabled={savingId === apt.id}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        {savingId === apt.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Cancelled appointments */}
              {cancelled.length > 0 && (
                <details className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-gray-500 hover:text-gray-700">
                    {cancelled.length} cancelled appointment{cancelled.length > 1 ? "s" : ""}
                  </summary>
                  <div className="space-y-2 px-5 pb-4">
                    {cancelled.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 size={14} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{apt.hospital}</p>
                            {apt.department && (
                              <p className="text-xs text-gray-400">{apt.department}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(apt.appointment_date).toLocaleDateString("en-IE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <span className="text-xs font-semibold text-red-500">Cancelled</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Hero ── */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA3KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <span className="animate-fade-in-up mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <Activity size={14} /> Reducing Ireland's Healthcare Waiting Lists
            </span>

            <h1 className="animate-fade-in-up mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Health,{" "}
              <span className="text-teal-200">Assessed Online</span>
            </h1>

            <p className="animate-fade-in-up-delay mb-8 max-w-xl text-lg leading-relaxed text-white/85">
              DigiDoc is a digital healthcare triage platform that assesses
              non-serious health concerns online — so hospitals and GPs can
              focus on those who need it most.
            </p>

            <div className="animate-fade-in-up-delay-2 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/patient/symptoms"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-lg transition-transform hover:scale-[1.02]"
              >
                Start Free Assessment <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 -mt-12 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, stat: "1M+", label: "Patients on waiting lists in Ireland" },
            { icon: Clock, stat: "< 5 min", label: "Average assessment time" },
            { icon: Shield, stat: "24 hr", label: "Doctor review turnaround" },
          ].map((s) => (
            <div
              key={s.label}
              className="gradient-card flex items-center gap-4 rounded-2xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.stat}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-extrabold text-gray-900">
            How DigiDoc Works
          </h2>
          <p className="mx-auto max-w-xl text-gray-500">
            Three simple steps to get a professional health assessment without
            leaving your home.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Describe Your Symptoms",
              desc: "Tell us where it hurts, pick from common symptoms, and rate the severity through our guided form.",
              icon: Stethoscope,
            },
            {
              step: "2",
              title: "AI-Assisted Triage",
              desc: "Our system analyses your input and categorises urgency — self-care, GP visit, or urgent attention.",
              icon: Activity,
            },
            {
              step: "3",
              title: "Doctor Review",
              desc: "A licensed doctor reviews your case within 24 hours, especially prioritising weekends and off-hours.",
              icon: CheckCircle,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="group relative rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="gradient-hero overflow-hidden rounded-3xl p-10 text-center sm:p-16">
          <h2 className="mb-4 text-3xl font-extrabold text-white">
            Ready to Check Your Symptoms?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-white/80">
            It takes less than 5 minutes. No account needed. Your assessment
            will be reviewed by a real doctor.
          </p>
          <Link
            to="/patient/symptoms"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-primary shadow-lg transition-transform hover:scale-[1.02]"
          >
            Start Your Assessment <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
