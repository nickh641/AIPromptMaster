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
  const { toast } = useToast();

  // Fetch all prompts
  const { data: prompts, isLoading: isLoadingPrompts } = useQuery({
    queryKey: ["/api/prompts"],
  });

  // Fetch messages for selected prompt
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/prompts", selectedPromptId, "messages"],
    enabled: selectedPromptId !== null,
  });

  // Select first prompt by default
  useEffect(() => {
    if (prompts && prompts.length > 0 && !selectedPromptId) {
      setSelectedPromptId(prompts[0].id);
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

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    await sendMessageMutation.mutateAsync(content);
  };

  const selectedPrompt = selectedPromptId && prompts 
    ? prompts.find((p: Prompt) => p.id === selectedPromptId) 
    : null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Prompt Sidebar */}
      <PromptList 
        prompts={prompts || []} 
        isLoading={isLoadingPrompts}
        selectedPromptId={selectedPromptId}
        onSelectPrompt={setSelectedPromptId}
      />
      
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 p-4">
          {isLoadingPrompts || !selectedPrompt ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-medium text-gray-800">{selectedPrompt.name}</h2>
              <p className="text-sm text-gray-500">
                Using: {selectedPrompt.model} · Temperature: {selectedPrompt.temperature}
              </p>
            </>
          )}
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {isLoadingMessages ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-start mb-4">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <Skeleton className="h-20 w-full max-w-3xl rounded-lg" />
                </div>
              ))}
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((message: Message) => (
              <ChatMessage 
                key={message.id}
                content={message.content}
                isUser={message.isUser}
              />
            ))
          ) : selectedPrompt ? (
            <ChatMessage 
              content={`Hello! I'm your ${selectedPrompt.name}. How can I help you today?`}
              isUser={false}
            />
          ) : null}
        </div>
        
        {/* Message input */}
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={sendMessageMutation.isPending}
          disabled={!selectedPromptId}
        />
      </div>
    </div>
  );
}
