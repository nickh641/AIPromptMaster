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
  isChecking: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    console.log("Checking authentication status from localStorage");
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Found user in localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem("user");
      }
    } else {
      console.log("No user found in localStorage");
    }
    
    // Signal that we've finished checking auth state
    setIsChecking(false);
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
      console.log("Login successful, user data:", userData); // Debug info
      
      // Store user data first
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Update state and wait until next render to ensure the update is applied
      setUser(userData);
      
      // Add a small delay to ensure state is updated before redirect
      setTimeout(() => {
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.username}!`,
        });
        
        // Redirect based on user role
        if (userData.isAdmin) {
          console.log("Redirecting to admin page, userData:", userData);
          setLocation("/admin");
        } else {
          setLocation("/chat");
        }
      }, 100);
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const logout = () => {
    // Clear user state
    setUser(null);
    
    // Remove from localStorage
    localStorage.removeItem("user");
    
    // Show toast
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to login page
    setTimeout(() => {
      setLocation("/login");
    }, 50);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user !== null,
        isAdmin: user?.isAdmin || false,
        isChecking,
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
