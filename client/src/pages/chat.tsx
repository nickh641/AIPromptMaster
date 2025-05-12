import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PromptList } from "@/components/prompt-list";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Prompt, Message } from "@shared/schema";

export default function ChatPage() {
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [chatStarted, setChatStarted] = useState(false);
  const { toast } = useToast();

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
    if (Array.isArray(prompts) && prompts.length > 0 && !selectedPromptId) {
      setSelectedPromptId(prompts[0].id);
    }
  }, [prompts, selectedPromptId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedPromptId) throw new Error("No prompt selected");
      
      // Send user message to API
      const response = await apiRequest(
        "POST", 
        `/api/prompts/${selectedPromptId}/messages`,
        { content }
      );
      
      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh messages to get the AI response
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error in chat",
        description: error.message || "There was a problem with the AI response. Please try again or contact an administrator.",
        variant: "destructive",
      });
      
      // Still refresh to show the user message without AI response
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    }
  });

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !chatStarted) return;
    
    await sendMessageMutation.mutateAsync(content);
  };

  // Initialize chat session
  const handleStartChat = () => {
    if (!selectedPromptId) {
      toast({
        title: "No prompt selected",
        description: "Please select a prompt before starting a chat.",
        variant: "destructive",
      });
      return;
    }
    
    // This will trigger the AI to respond with initial greeting
    setChatStarted(true);
    
    // Clear any previous messages
    queryClient.removeQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    
    // Force refetch to get a fresh session
    queryClient.invalidateQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
  };

  // Clear the chat and start fresh
  const handleClearChat = () => {
    if (!selectedPromptId) return;
    
    queryClient.removeQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    setChatStarted(false);
    
    // Briefly wait before restarting to ensure clean state
    setTimeout(() => {
      setChatStarted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    }, 100);
    
    toast({
      title: "Chat cleared",
      description: "Starting a new conversation.",
    });
  };

  const selectedPrompt = selectedPromptId && Array.isArray(prompts) && prompts.length > 0
    ? prompts.find((p) => p.id === selectedPromptId) 
    : null;

  return (
    <div className="max-w-4xl mx-auto p-8 rounded-3xl border border-gray-300 bg-gray-50 shadow-sm my-8">
      {/* Top Section with Prompt Selection */}
      <PromptList 
        prompts={Array.isArray(prompts) ? prompts : []} 
        isLoading={isLoadingPrompts}
        selectedPromptId={selectedPromptId}
        onSelectPrompt={setSelectedPromptId}
        onStartChat={handleStartChat}
        onClearChat={handleClearChat}
      />
      
      {/* Chat Messages Section */}
      {chatStarted && selectedPrompt && (
        <>
          <h3 className="font-medium mb-2">Prompt Name</h3>
          <div className="bg-white border border-gray-300 rounded-lg p-6 mb-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            {isLoadingMessages ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                  <Skeleton key={index} className="h-6 w-full" />
                ))}
              </div>
            ) : Array.isArray(messages) && messages.length > 0 ? (
              messages.map((message) => (
                <ChatMessage 
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                />
              ))
            ) : (
              // Initial welcome message showing details from the selected prompt
              <ChatMessage 
                content={`Hello! I'm your ${selectedPrompt.name} assistant.
                
I'm configured with:
- Model: ${selectedPrompt.model}
- Temperature: ${selectedPrompt.temperature}
- Provider: ${selectedPrompt.provider}

How can I help you today?`}
                isUser={false}
              />
            )}
          </div>
          
          {/* Chat Input */}
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={sendMessageMutation.isPending}
            disabled={!selectedPromptId || !chatStarted}
          />
        </>
      )}
    </div>
  );
}
