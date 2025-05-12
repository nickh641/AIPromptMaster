import { User, MessageCircle } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export function ChatMessage({ content, isUser }: ChatMessageProps) {
  return (
    <div className={`flex items-start mb-4 chat-message ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      )}
      
      <div className={`${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
        } rounded-lg p-3 max-w-3xl`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
