import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { queryClient } from "./lib/queryClient";
import ChatPage from "@/pages/chat";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function Router() {
  const { isAuthenticated, isAdmin, isChecking } = useAuth();
  const [, navigate] = useLocation();
  
  // Use the actual window.location.pathname instead of tracking in state
  // This fixes navigation issues with login redirects
  
  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  // Handle authentication redirects only after auth check is complete
  useEffect(() => {
    if (isChecking) return; // Don't redirect while still checking auth state
    
    const currentPath = window.location.pathname;
    
    if (!isAuthenticated && 
        !["/login"].includes(currentPath)) {
      navigate("/login");
    } else if (isAuthenticated && currentPath === "/login") {
      // Redirect to the appropriate page when logged in but still on login page
      navigate(isAdmin ? "/admin" : "/chat");
    }
  }, [isAuthenticated, isAdmin, navigate, isChecking]);

  // Show loading indicator while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      {isAuthenticated && <Navbar />}
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
