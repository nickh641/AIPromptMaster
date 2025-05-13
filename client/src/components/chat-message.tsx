interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export function ChatMessage({ content, isUser }: ChatMessageProps) {
  // Check if the message content contains an error message
  const isErrorMessage = !isUser && content.startsWith('Error:');
  
  return (
    <div className="w-full mb-4">
      <div className={`${isUser ? 'mr-auto' : 'ml-auto'} max-w-[80%]`}>
        <div className={`
          ${isUser ? 'border-2 border-gray-300 bg-white' : 'bg-blue-200 border-blue-300'} 
          ${isErrorMessage ? 'border-red-300 bg-red-50' : ''} 
          border rounded-lg p-3
        `}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-gray-800">{content}</p>
          ) : isErrorMessage ? (
            <div>
              <p className="font-medium text-red-600 mb-1">AI Service Error</p>
              <p className="whitespace-pre-wrap text-red-600">{content}</p>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-gray-800">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
