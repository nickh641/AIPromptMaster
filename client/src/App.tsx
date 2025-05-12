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
  const { isAuthenticated, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  
  // Use the actual window.location.pathname instead of tracking in state
  // This fixes navigation issues with login redirects
  
  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  // Handle authentication redirects
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    if (!isAuthenticated && 
        !["/login"].includes(currentPath)) {
      navigate("/login");
    } else if (isAuthenticated && currentPath === "/login") {
      // Redirect to the appropriate page when logged in but still on login page
      navigate(isAdmin ? "/admin" : "/chat");
    }
  }, [isAuthenticated, isAdmin, navigate]);

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
