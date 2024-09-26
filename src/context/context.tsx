"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const AuthContext = createContext(
  {} as { user: User | null; setUser: (user: User | null) => void }
);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser((prev) => user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
};
