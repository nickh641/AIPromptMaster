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
    <div className="max-w-4xl mx-auto p-8 rounded-3xl border-2 border-gray-300 bg-white shadow-sm">
      {/* Prompt name at the top */}
      <div className="mb-4 flex items-center">
        <span className="font-medium mr-2">Prompt:</span>
        <span className="border border-gray-300 rounded px-2 py-1 bg-gray-50">{promptName}</span>
      </div>
      
      {/* Chat Messages Section */}
      <div className="bg-white border-2 border-gray-300 rounded-xl p-6 mb-4 min-h-[300px] max-h-[400px] overflow-y-auto">
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
          <ChatMessage 
            content={`Hello! I'm your ${promptName} assistant. How can I help you today?`}
            isUser={false}
          />
        )}
      </div>
      
      {/* Chat Input and Buttons */}
      <div className="flex flex-col space-y-2">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 border-2 border-gray-300 rounded-md bg-white py-2"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit" 
            className="bg-pink-200 hover:bg-pink-300 text-black rounded-md border border-pink-300 px-6 font-medium"
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <div className="h-4 w-4 border-2 border-t-transparent border-black rounded-full animate-spin mr-1"></div>
            ) : null}
            Send
          </Button>
        </form>
        
        <Button 
          onClick={onEndChat}
          className="bg-green-200 hover:bg-green-300 text-black border border-green-300 rounded-md px-6 font-medium self-end"
        >
          End chat
        </Button>
      </div>
    </div>
  );
}