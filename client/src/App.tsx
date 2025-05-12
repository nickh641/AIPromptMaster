import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { queryClient } from "./lib/queryClient";
import ChatPage from "@/pages/chat";
import AdminPage from "@/pages/admin";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  const [location, setLocation] = useState(() => 
    window.location.pathname === "/" ? "/chat" : window.location.pathname
  );

  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", "/chat");
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <Switch location={location}>
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
