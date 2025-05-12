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
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useState(() => 
    window.location.pathname === "/" ? "/login" : window.location.pathname
  );
  const [, navigate] = useLocation();

  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && 
        !["/login"].includes(window.location.pathname)) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col h-screen">
      {isAuthenticated && <Navbar />}
      <Switch location={location}>
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
