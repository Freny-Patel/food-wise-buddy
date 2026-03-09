import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "restaurant" | "volunteer";

interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const users: { name: string; email: string; password: string; role: UserRole }[] = [
  { name: "Green Kitchen", email: "restaurant@test.com", password: "demo123", role: "restaurant" },
  { name: "John Volunteer", email: "volunteer@test.com", password: "demo123", role: "volunteer" },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser({ name: found.name, email: found.email, role: found.role });
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, password: string, role: UserRole) => {
    if (users.find((u) => u.email === email)) return false;
    users.push({ name, email, password, role });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
