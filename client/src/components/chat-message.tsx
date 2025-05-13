interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export function ChatMessage({ content, isUser }: ChatMessageProps) {
  // Check if the message content contains an error message
  const isErrorMessage = !isUser && content.startsWith('Error:');
  
  return (
    <div className="w-full mb-6 flex">
      <div className={`
        ${isUser ? 'ml-auto' : 'mr-auto'} 
        max-w-[80%]
      `}>
        {/* Message container */}
        <div className={`
          ${isUser 
            ? 'bg-white border-gray-200 shadow-sm' 
            : 'bg-blue-100 border-blue-200'
          } 
          ${isErrorMessage 
            ? 'bg-red-50 border-red-200' 
            : ''
          } 
          border rounded-2xl px-4 py-3
          ${isUser 
            ? 'rounded-tr-none' 
            : 'rounded-tl-none'
          }
        `}>
          {/* Content */}
          {isUser ? (
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{content}</p>
          ) : isErrorMessage ? (
            <div>
              <p className="font-medium text-red-600 mb-1">AI Service Error</p>
              <p className="whitespace-pre-wrap text-red-600 leading-relaxed">{content}</p>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{content}</p>
          )}
        </div>
        
        {/* Timestamp or metadata could go here */}
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right mr-2' : 'ml-2'}`}>
          {isUser ? 'You' : 'AI Assistant'}
        </div>
      </div>
    </div>
  );
}
