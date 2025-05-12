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
  const { data: prompts, isLoading: isLoadingPrompts } = useQuery({
    queryKey: ["/api/prompts"],
  });

  // Fetch messages for selected prompt
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/prompts", selectedPromptId, "messages"],
    enabled: selectedPromptId !== null && chatStarted,
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
    if (!content.trim() || !chatStarted) return;
    
    await sendMessageMutation.mutateAsync(content);
  };

  const handleStartChat = () => {
    setChatStarted(true);
  };

  const handleClearChat = () => {
    queryClient.removeQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    setChatStarted(false);
    setTimeout(() => {
      setChatStarted(true);
    }, 100);
  };

  const selectedPrompt = selectedPromptId && prompts 
    ? prompts.find((p: Prompt) => p.id === selectedPromptId) 
    : null;

  return (
    <div className="max-w-4xl mx-auto p-8 rounded-3xl border border-gray-300 bg-gray-50 shadow-sm my-8">
      {/* Top Section with Prompt Selection */}
      <PromptList 
        prompts={prompts || []} 
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
          <div className="bg-white border border-gray-300 rounded-lg p-6 mb-4 min-h-[200px]">
            {isLoadingMessages ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                  <Skeleton key={index} className="h-6 w-full" />
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
            ) : (
              <ChatMessage 
                content={`Hello! I'm your ${selectedPrompt.name}. How can I help you today?`}
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
