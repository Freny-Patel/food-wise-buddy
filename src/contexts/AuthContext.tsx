import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Simple in-memory store for demo
const users: { name: string; email: string; password: string }[] = [
  { name: "Demo User", email: "demo@test.com", password: "demo123" },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser({ name: found.name, email: found.email });
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, password: string) => {
    if (users.find((u) => u.email === email)) return false;
    users.push({ name, email, password });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
