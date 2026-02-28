import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
});

const STORAGE_KEY = "digidoc_user";

// ── Demo accounts (no backend required) ──────────────────────────────────────
const DEMO_USERS = {
  "gp@demo.ie": {
    password: "demo1234",
    user: {
      id: "demo-gp-1",
      email: "gp@demo.ie",
      role: "gp",
      first_name: "Demo",
      last_name: "Doctor",
    },
  },
  "patient@demo.ie": {
    password: "demo1234",
    user: {
      id: "demo-patient-1",
      email: "patient@demo.ie",
      role: "patient",
      first_name: "Demo",
      last_name: "Patient",
    },
  },
};

async function apiPost(path, body) {
  let res;
  try {
    res = await fetch("/api" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach server. Please use a demo account.");
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Server returned an unexpected response. Please use a demo account.");
  }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore malformed data
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async ({ email, password }) => {
    // Check demo accounts first (works without a backend)
    const demo = DEMO_USERS[email.trim().toLowerCase()];
    if (demo) {
      if (demo.password !== password.trim()) throw new Error("Incorrect password for demo account.");
      setUser(demo.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo.user));
      return demo.user;
    }
    const userData = await apiPost("/auth/login", { email: email.trim(), password: password.trim() });
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return userData;
  };

  const signUp = async ({ email, password, firstName = "", lastName = "", role = "patient" }) => {
    const userData = await apiPost("/auth/register", { email, password, firstName, lastName, role });
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return userData;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // `profile` keeps the same shape the rest of the app expects
  const profile = user
    ? { ...user, first_name: user.first_name, last_name: user.last_name }
    : null;

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
