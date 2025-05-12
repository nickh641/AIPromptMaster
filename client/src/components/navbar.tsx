import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleViewChange = (value: string) => {
    if ((value === "admin" && !isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive"
      });
      return;
    }
    
    setLocation(`/${value}`);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/chat">
              <span className="text-xl font-bold text-gray-800 cursor-pointer">AI Wrapper</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <Select value={location.substring(1)} onValueChange={handleViewChange}>
                <SelectTrigger className="bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded-lg w-32">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">User View</SelectItem>
                  <SelectItem value="admin">Admin View</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarFallback className="bg-gray-200 text-gray-500">
                      {user?.username.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700">
                    {user?.username || "Guest"}
                    {user?.isAdmin && " (Admin)"}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
