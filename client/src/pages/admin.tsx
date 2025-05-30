import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptForm } from "@/components/prompt-form";
import { useToast } from "@/hooks/use-toast";
import { Prompt } from "@shared/schema";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user, isAdmin, isChecking, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingPromptId, setEditingPromptId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Debug admin status
  console.log("Admin page - Auth state:", { user, isAdmin, isChecking });

  // Check if user has admin privileges (either from context or localStorage)
  const hasAdminPrivileges = useMemo(() => {
    if (isAdmin) return true;
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return false;
      const parsedUser = JSON.parse(storedUser);
      return !!parsedUser.isAdmin;
    } catch (e) {
      return false;
    }
  }, [isAdmin]);

  // Fetch all prompts - declare this before any conditional returns
  const { data: prompts, isLoading } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
    // Disable the query if user is not admin to avoid unnecessary requests
    enabled: hasAdminPrivileges,
  });

  // Use an effect for redirects instead of doing it during render
  // Only redirect if we're done checking auth state and user is not admin
  useEffect(() => {
    console.log("Admin useEffect - Auth state:", { user, isAdmin, isChecking });
    
    // Check if we have a user in localStorage as a fallback
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const hasAdminRights = isAdmin || (parsedUser && parsedUser.isAdmin);
    
    console.log("Admin access check:", { hasAdminRights, parsedUser });
    
    if (!isChecking && !hasAdminRights) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setLocation("/chat");
    }
  }, [isChecking, isAdmin, user, setLocation, toast]);

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">Checking permissions...</p>
        </div>
      </div>
    );
  }
  
  // Check if we have admin rights either from context or localStorage
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const hasAdminRights = isAdmin || (parsedUser && parsedUser.isAdmin);
  
  // Return early if not admin to avoid rendering the admin content
  if (!isChecking && !hasAdminRights) {
    return null;
  }

  const handleEditPrompt = (promptId: number) => {
    setEditingPromptId(promptId);
  };

  const handleCreateNewPrompt = () => {
    setEditingPromptId(null);
    setShowCreateForm(true);
  };

  const promptsArray = Array.isArray(prompts) ? prompts : [];

  const selectedPrompt =
    editingPromptId && promptsArray.length > 0
      ? promptsArray.find((p) => p.id === editingPromptId)
      : null;

  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Admin View</h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{user?.username || parsedUser?.username || "admin"}</span>
                <button 
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  logout
                </button>
              </div>
            </div>

            {/* Create New Prompt Section */}
            <div className="mb-8">
              {editingPromptId ? (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Prompt</h3>
                  <PromptForm
                    promptData={selectedPrompt}
                    onSuccess={() => {
                      toast({
                        title: "Prompt updated",
                        description: "Your prompt has been updated successfully.",
                      });
                      setEditingPromptId(null);
                    }}
                  />
                </div>
              ) : (
                <>
                  {!showCreateForm ? (
                    <button
                      onClick={handleCreateNewPrompt}
                      className="px-4 py-2 bg-pink-200 text-pink-800 font-medium rounded-md hover:bg-pink-300 transition-colors"
                    >
                      Create new prompt
                    </button>
                  ) : (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Create New Prompt</h3>
                        <button 
                          onClick={() => setShowCreateForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                      <PromptForm
                        onSuccess={() => {
                          toast({
                            title: "Prompt created",
                            description: "Your prompt has been created successfully.",
                          });
                          setShowCreateForm(false);
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Manage Prompts Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Prompts</h3>
              
              {isLoading ? (
                <div className="text-center py-4">Loading prompts...</div>
              ) : promptsArray.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="py-2 text-left font-medium text-gray-900">Prompt name</th>
                        <th className="py-2 text-left font-medium text-gray-900">API Provider</th>
                        <th className="py-2 text-left font-medium text-gray-900">Model</th>
                        <th className="py-2 text-left font-medium text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promptsArray.map((prompt) => (
                        <tr key={prompt.id} className="border-b border-gray-200">
                          <td className="py-3 whitespace-nowrap text-sm text-gray-900">
                            {prompt.name}
                          </td>
                          <td className="py-3 whitespace-nowrap text-sm text-gray-700">
                            {prompt.provider ? prompt.provider.charAt(0).toUpperCase() + prompt.provider.slice(1) : "None"}
                          </td>
                          <td className="py-3 whitespace-nowrap text-sm text-gray-700">
                            {prompt.model}
                          </td>
                          <td className="py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEditPrompt(prompt.id)}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              edit
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm("Are you sure you want to delete this prompt?")) {
                                  try {
                                    const response = await fetch(`/api/prompts/${prompt.id}`, {
                                      method: "DELETE",
                                    });
                                    
                                    if (response.ok) {
                                      toast({
                                        title: "Prompt deleted",
                                        description: "The prompt was successfully deleted.",
                                      });
                                      // Refetch prompts by invalidating the query
                                      await queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
                                    } else {
                                      const error = await response.json();
                                      throw new Error(error.message || "Failed to delete prompt");
                                    }
                                  } catch (error: any) {
                                    toast({
                                      title: "Error",
                                      description: error.message || "Failed to delete prompt",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No prompts available. Create your first prompt!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
