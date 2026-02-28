import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Clock,
  Stethoscope,
  Activity,
  Users,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
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
                to="/symptoms"
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
      <section className="-mt-12 relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
            to="/symptoms"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-primary shadow-lg transition-transform hover:scale-[1.02]"
          >
            Start Your Assessment <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
