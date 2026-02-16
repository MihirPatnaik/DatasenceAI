// src/smartsocial/hooks/useUserContext.tsx

import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../utils/firebase";

interface UserContextType {
  user: User | null;
  loading: boolean;
  timezone: string;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  timezone: "UTC",
});

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: UserContextType = {
    user,
    loading,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
