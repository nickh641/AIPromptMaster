import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="w-full mt-4">
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Chat entry"
          className="flex-1 border-2 border-gray-300 rounded-md bg-white py-2"
          disabled={isLoading || disabled}
        />
        <Button 
          type="submit" 
          className="bg-pink-200 hover:bg-pink-300 text-black rounded-md border border-pink-300 px-6 font-medium"
          disabled={!message.trim() || isLoading || disabled}
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-t-transparent border-black rounded-full animate-spin mr-1"></div>
          ) : null}
          Send
        </Button>
      </form>
    </div>
  );
}
