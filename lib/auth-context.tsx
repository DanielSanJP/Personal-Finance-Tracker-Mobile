import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChange,
  getCurrentUser,
  signOut,
  isGuestUser,
} from "./auth";
import type { User } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if current user is guest
  const isGuest = user ? isGuestUser(user) : false;

  useEffect(() => {
    // Check if user is already logged in
    getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange(async (session) => {
      if (session?.user) {
        const userData = await getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isGuest, signOut: handleSignOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
