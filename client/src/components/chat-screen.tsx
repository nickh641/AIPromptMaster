import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChatMessage } from "@/components/chat-message";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Prompt, Message } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatScreenProps {
  promptId: number;
  promptName: string;
  onEndChat: () => void;
}

export function ChatScreen({ promptId, promptName, onEndChat }: ChatScreenProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  // Fetch messages for selected prompt
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/prompts", promptId, "messages"],
    enabled: !!promptId,
  });
  
  // Mutation to initialize the chat with the first AI message
  const initializeChatMutation = useMutation({
    mutationFn: async () => {
      if (!promptId) throw new Error("No prompt selected");
      
      const response = await apiRequest(
        "POST", 
        `/api/prompts/${promptId}/initialize`,
        {}
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initialize chat");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh messages to get the AI response
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", promptId, "messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error initializing chat",
        description: error.message || "There was a problem starting the chat with AI. Please try again or contact an administrator.",
        variant: "destructive",
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!promptId) throw new Error("No prompt selected");
      
      // Send user message to API
      const response = await apiRequest(
        "POST", 
        `/api/prompts/${promptId}/messages`,
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
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", promptId, "messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error in chat",
        description: error.message || "There was a problem with the AI response. Please try again or contact an administrator.",
        variant: "destructive",
      });
      
      // Still refresh to show the user message without AI response
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", promptId, "messages"] });
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    await sendMessageMutation.mutateAsync(message);
    setMessage("");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with prompt name */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-medium mr-2 text-gray-700">Prompt:</span>
            <span className="border border-gray-300 rounded-md px-3 py-1 bg-white text-gray-800 font-medium">{promptName}</span>
          </div>
          <Button 
            onClick={onEndChat}
            className="bg-green-100 hover:bg-green-200 text-green-800 border border-green-300 rounded-md px-4 py-2 font-medium text-sm"
          >
            End chat
          </Button>
        </div>
      </header>
      
      {/* Main chat area - takes up all available space */}
      <main className="flex-1 overflow-hidden relative">
        <div className="max-w-5xl mx-auto h-full flex flex-col pt-6 px-6">
          {/* Chat Messages Section - scrollable area that takes most space */}
          <div className="flex-1 overflow-y-auto mb-6 pr-2">
            {isLoadingMessages ? (
              <div className="space-y-6 py-4">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
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
              <ChatMessage 
                content={`Hello! I'm your ${promptName} assistant. How can I help you today?`}
                isUser={false}
              />
            )}
          </div>
          
          {/* Input area fixed at bottom */}
          <div className="py-4 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-5xl mx-auto">
              <Input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 border-2 border-gray-300 rounded-md bg-white py-3 px-4 focus:border-blue-400 focus:ring-blue-300"
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                type="submit" 
                className="bg-pink-200 hover:bg-pink-300 text-black rounded-md border border-pink-300 px-6 py-3 font-medium"
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-black rounded-full animate-spin mr-2"></div>
                ) : null}
                Send
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}