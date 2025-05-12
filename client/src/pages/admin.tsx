import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptForm } from "@/components/prompt-form";
import { useToast } from "@/hooks/use-toast";
import { Prompt } from "@shared/schema";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { isAdmin, isChecking } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingPromptId, setEditingPromptId] = useState<number | null>(null);

  // Use an effect for redirects instead of doing it during render
  // Only redirect if we're done checking auth state and user is not admin
  useEffect(() => {
    if (!isChecking && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setLocation("/chat");
    }
  }, [isChecking, isAdmin, setLocation, toast]);

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
  
  // Return early if not admin to avoid rendering the admin content
  if (!isAdmin) {
    return null;
  }

  // Fetch all prompts
  const { data: prompts, isLoading } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
  });

  const handleEditPrompt = (promptId: number) => {
    setEditingPromptId(promptId);
  };

  const handleCreateNewPrompt = () => {
    setEditingPromptId(null);
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
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Prompt Manager
            </h2>

            <Tabs defaultValue="create" className="w-full">
              <TabsList className="border-b border-gray-200 w-full mb-6 grid grid-cols-2">
                <TabsTrigger
                  value="create"
                  className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 border-transparent text-gray-500 py-2 px-1 border-b-2 font-medium text-sm"
                  onClick={handleCreateNewPrompt}
                >
                  {editingPromptId ? "Edit Prompt" : "Create New Prompt"}
                </TabsTrigger>
                <TabsTrigger
                  value="manage"
                  className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 border-transparent text-gray-500 py-2 px-1 border-b-2 font-medium text-sm"
                >
                  Manage Existing Prompts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-2">
                <PromptForm
                  promptData={selectedPrompt}
                  onSuccess={() => {
                    if (!editingPromptId) {
                      toast({
                        title: "Prompt created",
                        description:
                          "Your prompt has been created successfully.",
                      });
                    } else {
                      toast({
                        title: "Prompt updated",
                        description:
                          "Your prompt has been updated successfully.",
                      });
                      setEditingPromptId(null);
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="manage" className="mt-2">
                {isLoading ? (
                  <div className="text-center py-4">Loading prompts...</div>
                ) : promptsArray.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Temperature
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {promptsArray.map((prompt) => (
                          <tr key={prompt.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {prompt.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {prompt.model}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {prompt.temperature}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditPrompt(prompt.id)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Edit
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
