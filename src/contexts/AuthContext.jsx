import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Fetch profile from public.profiles, including practice info */
  const fetchProfile = async (userId) => {
    try {
      // Try the full query with practice join first
      let { data, error } = await supabase
        .from("profiles")
        .select("*, practice:practices!profiles_practice_id_fkey(id, name, address)")
        .eq("id", userId)
        .single();

      // If the join fails (practices table may not exist yet), fall back to plain query
      if (error) {
        const fallback = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        data = fallback.data;
        error = fallback.error;
      }

      if (!error && data) {
        // For GPs, also try to fetch the practices they own
        if (data.role === "gp") {
          try {
            const { data: owned } = await supabase
              .from("practices")
              .select("*")
              .eq("owner_id", userId)
              .order("name");
            data.owned_practices = owned || [];
          } catch {
            data.owned_practices = [];
          }
        }
        setProfile(data);
      }
      return data;
    } catch (err) {
      console.error("fetchProfile error:", err);
      return null;
    }
  };

  /* Listen to auth state changes */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error("getSession error:", err);
      setLoading(false);
    });

    // Subscribe to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await fetchProfile(u.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* Sign up (patient by default) */
  const signUp = async ({
    email,
    password,
    firstName,
    lastName,
    role = "patient",
    practiceId,
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
          practice_id: practiceId || null,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  /* Sign in */
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  /* Sign out */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
