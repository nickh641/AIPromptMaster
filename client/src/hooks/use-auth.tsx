import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // For demo purposes, initialize with a user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Auto-login as regular user for demo
      setUser({
        id: 2,
        username: "user",
        isAdmin: false
      });
      localStorage.setItem("user", JSON.stringify({
        id: 2,
        username: "user",
        isAdmin: false
      }));
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });

      // Redirect based on user role
      if (userData.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/chat");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setLocation("/chat");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // For demonstration purposes, we'll provide a simulated admin/user login
  const simulateLogin = (isAdmin: boolean) => {
    const userData = isAdmin 
      ? { id: 1, username: "admin", isAdmin: true }
      : { id: 2, username: "user", isAdmin: false };
    
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Redirect based on user role
    if (isAdmin) {
      setLocation("/admin");
    } else {
      setLocation("/chat");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user !== null,
        isAdmin: user?.isAdmin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
