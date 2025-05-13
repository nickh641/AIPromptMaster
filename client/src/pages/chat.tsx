import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PromptList } from "@/components/prompt-list";
import { ChatScreen } from "@/components/chat-screen";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Prompt } from "@shared/schema";

export default function ChatPage() {
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [chatStarted, setChatStarted] = useState(false);
  const { toast } = useToast();

  // Fetch all prompts
  const { data: prompts = [], isLoading: isLoadingPrompts } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
  });

  // Select first prompt by default
  useEffect(() => {
    if (Array.isArray(prompts) && prompts.length > 0 && !selectedPromptId) {
      setSelectedPromptId(prompts[0].id);
    }
  }, [prompts, selectedPromptId]);

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
    
    // Clear any previous messages
    queryClient.removeQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    
    // Start the chat
    setChatStarted(true);
  };

  // End the chat session
  const handleEndChat = () => {
    setChatStarted(false);
    queryClient.removeQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    
    toast({
      title: "Chat ended",
      description: "The chat session has been ended.",
    });
  };

  // Clear the chat and start fresh
  const handleClearChat = () => {
    if (!selectedPromptId) return;
    
    queryClient.removeQueries({ queryKey: ["/api/prompts", selectedPromptId, "messages"] });
    setChatStarted(false);
    
    toast({
      title: "Chat cleared",
      description: "Starting a new conversation.",
    });
  };

  const selectedPrompt = selectedPromptId && Array.isArray(prompts) && prompts.length > 0
    ? prompts.find((p) => p.id === selectedPromptId) 
    : null;

  // If chat is started, show the chat screen
  if (chatStarted && selectedPrompt) {
    return (
      <ChatScreen 
        promptId={selectedPrompt.id}
        promptName={selectedPrompt.name}
        onEndChat={handleEndChat}
      />
    );
  }

  // Otherwise, show the prompt selection screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border-2 border-gray-300 bg-white shadow-md">
        {/* Prompt Selection in a Card */}
        <div className="p-8 rounded-3xl">
          <PromptList 
            prompts={Array.isArray(prompts) ? prompts : []} 
            isLoading={isLoadingPrompts}
            selectedPromptId={selectedPromptId}
            onSelectPrompt={setSelectedPromptId}
            onStartChat={handleStartChat}
            onClearChat={handleClearChat}
          />
        </div>
      </div>
    </div>
  );
}
