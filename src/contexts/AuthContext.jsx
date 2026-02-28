import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  profileError: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  /* Fetch profile from public.profiles, including practice info */
  const fetchProfile = async (userId, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        // Retry once after 1.5s — handles slow DB / cold start
        if (retryCount < 1) {
          console.warn("fetchProfile: retrying in 1.5s…", error?.message);
          await new Promise((r) => setTimeout(r, 1500));
          return fetchProfile(userId, retryCount + 1);
        }
        console.error("fetchProfile: failed after retry", error);
        setProfile(null);
        setProfileError(true);
        return null;
      }

      // For GPs, fetch practices they work at via practice_staff
      if (data.role === "gp") {
        try {
          const { data: staffRecords } = await supabase
            .from("practice_staff")
            .select("practice:practices(*)")
            .eq("gp_id", userId);
          data.practices = (staffRecords || []).map((r) => r.practice).filter(Boolean);
        } catch {
          data.practices = [];
        }
      }

      // For patients with a practice_id, fetch the practice name
      if (data.practice_id) {
        try {
          const { data: practice } = await supabase
            .from("practices")
            .select("id, name, address")
            .eq("id", data.practice_id)
            .single();
          data.practice = practice;
        } catch {
          data.practice = null;
        }
      }

      setProfileError(false);
      setProfile(data);
      return data;
    } catch (err) {
      console.error("fetchProfile error:", err);
      setProfile(null);
      setProfileError(true);
      return null;
    }
  };

  // Track whether signIn is actively running so onAuthStateChange doesn't double-fetch
  let signInActive = false;

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

    // Subscribe to changes (but skip if signIn is handling it)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (signInActive) return; // signIn will handle the profile fetch
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

  /* Sign in — fetches profile before returning so ProtectedRoute has it */
  const signIn = async ({ email, password }) => {
    signInActive = true;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return data;
    } finally {
      signInActive = false;
      setLoading(false);
    }
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
      value={{ user, profile, loading, profileError, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
