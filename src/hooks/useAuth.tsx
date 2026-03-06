import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "teacher" | "user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  userRole: UserRole;
  profileStatus: string;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [profileStatus, setProfileStatus] = useState<string>("pending");

  const isAdmin = userRole === "admin";
  const isTeacher = userRole === "teacher";

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    
    if (data && data.length > 0) {
      const roles = data.map(r => r.role as string);
      if (roles.includes("admin")) {
        setUserRole("admin");
      } else if (roles.includes("teacher")) {
        setUserRole("teacher");
      } else {
        setUserRole("user");
      }
    } else {
      setUserRole("user");
    }
  };

  const fetchProfileStatus = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (data) {
      setProfileStatus(data.status || "pending");
    }
  };

  const createProfileIfNeeded = async (userId: string, email: string) => {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (!existingProfile) {
      const pendingName = localStorage.getItem("pending_display_name");
      const pendingRole = localStorage.getItem("pending_role");
      const displayName = pendingName || email.split("@")[0];
      const role = pendingRole || "student";
      
      await supabase.from("profiles").insert({
        user_id: userId,
        display_name: displayName,
        role: role,
        status: "pending",
      });
      
      // Also create user_role entry based on selected role
      if (pendingRole === "teacher") {
        await supabase.from("user_roles").insert({
          user_id: userId,
          role: "user" as any, // Default to user, admin will upgrade
        });
      }
      
      localStorage.removeItem("pending_display_name");
      localStorage.removeItem("pending_role");
      setProfileStatus("pending");
    } else {
      await fetchProfileStatus(userId);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
            createProfileIfNeeded(session.user.id, session.user.email || "");
          }, 0);
        } else {
          setUserRole("user");
          setProfileStatus("pending");
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
        createProfileIfNeeded(session.user.id, session.user.email || "");
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole("user");
    setProfileStatus("pending");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, isTeacher, userRole, profileStatus, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
