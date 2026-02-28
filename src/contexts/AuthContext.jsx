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

async function apiPost(path, body) {
  const res = await fetch("/api" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
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
    const userData = await apiPost("/auth/login", { email, password });
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
