import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChatMessage } from "@/components/chat-message";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Prompt, Message } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";

export default function ChatPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const initialScenarioId = params.get('id') ? parseInt(params.get('id')!) : null;
  
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(initialScenarioId);
  const [chatStarted, setChatStarted] = useState(true);
  const [userMessage, setUserMessage] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch all prompts
  const { data: prompts = [], isLoading: isLoadingPrompts } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
  });

  // Fetch messages for selected prompt
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/prompts", selectedPromptId, "messages"],
    enabled: selectedPromptId !== null && chatStarted,
  });

  // Select first prompt by default
  useEffect(() => {
    if (prompts && prompts.length > 0 && !selectedPromptId) {
      setSelectedPromptId(prompts[0].id);
      setChatStarted(true);
    }
  }, [prompts, selectedPromptId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedPromptId) throw new Error("No prompt selected");
      
      const response = await apiRequest(
        "POST", 
        `/api/prompts/${selectedPromptId}/messages`,
        { content }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userMessage.trim() || !chatStarted) return;
    
    await sendMessageMutation.mutateAsync(userMessage);
    setUserMessage("");
  };

  const handleEndRolePlay = () => {
    queryClient.removeQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    setChatStarted(false);
    navigate("/scenarios");
  };

  const handleBackToScenarios = () => {
    navigate("/scenarios");
  };

  const selectedPrompt = selectedPromptId && prompts 
    ? prompts.find((p: Prompt) => p.id === selectedPromptId) 
    : null;

  // If no prompts are available or still loading
  if ((prompts && prompts.length === 0) || (isLoadingPrompts && !selectedPrompt)) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-xl font-medium text-gray-800 mb-4">No scenarios available</h2>
        <p className="text-gray-600 mb-4">Please check back later or contact your instructor.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6">
      {selectedPrompt && (
        <div>
          {/* Header section with scenario name and role */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedPrompt.name}</h1>
              <p className="text-gray-600">Role-play as a crisis line responder</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-teal-500 text-teal-600 hover:bg-teal-50"
                onClick={handleEndRolePlay}
              >
                End Role Play
              </Button>
              <Button
                className="bg-purple-700 hover:bg-purple-800 text-white"
                onClick={handleBackToScenarios}
              >
                Back to Scenarios
              </Button>
            </div>
          </div>

          {/* Chat section */}
          <div className="border border-gray-200 rounded-lg mb-4 bg-white overflow-y-auto" style={{ minHeight: "50vh", maxHeight: "60vh" }}>
            {isLoadingMessages ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="p-4">
                {messages.map((message: Message) => (
                  <ChatMessage 
                    key={message.id}
                    content={message.content}
                    isUser={message.isUser}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4">
                <div className="bg-gray-100 rounded-lg p-4 mb-3">
                  <p className="text-gray-800">
                    (sighs heavily) I don't even know why I'm calling, just... I feel so empty, like nothing matters anymore. (voice flat, barely audible)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="mt-4">
            <div className="relative">
              <Input
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="w-full py-3 px-4 border-gray-300 rounded-lg"
                placeholder="Type your response here... (Press Enter to send)"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                className="absolute right-2 top-1.5 bg-teal-500 hover:bg-teal-600 text-white"
                disabled={!userMessage.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
