import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Stethoscope, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const links = [
    { to: "/patient", label: "Home" },
    { to: "/patient/symptoms", label: "Check Symptoms" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/patient" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <Stethoscope size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Digi<span className="text-primary">Doc</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === l.to
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/patient/symptoms"
            className="ml-3 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            Start Assessment
          </Link>
          {profile && (
            <>
              <span className="ml-3 text-xs text-gray-500">
                {profile.first_name}
              </span>
              <button
                onClick={handleLogout}
                className="ml-2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium ${
                pathname === l.to
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/patient/symptoms"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            Start Assessment
          </Link>
          {profile && (
            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600"
            >
              <LogOut size={14} /> Sign Out
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
