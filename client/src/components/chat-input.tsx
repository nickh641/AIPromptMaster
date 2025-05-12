import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || disabled) return;
    
    onSendMessage(message);
    setMessage("");
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex items-end">
        <div className="flex-1 mr-4">
          <Textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={3}
            className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading || disabled}
          />
        </div>
        <Button 
          type="submit" 
          className="inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={!message.trim() || isLoading || disabled}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send
        </Button>
      </form>
    </div>
  );
}
