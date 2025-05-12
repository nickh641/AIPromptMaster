import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
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

  // Determine which role the user has based on whether they're admin or not
  const userRole = isAdmin ? "admin" : "trainee";

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href={isAdmin ? "/admin" : "/chat"}>
              <span className="text-xl font-bold text-gray-900 cursor-pointer">AIPromptMaster</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.username}</span>
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleLogout}
                className="text-teal-600 hover:text-teal-800"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
