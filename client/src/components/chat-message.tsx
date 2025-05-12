interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export function ChatMessage({ content, isUser }: ChatMessageProps) {
  // Check if the message content contains an error message
  const isErrorMessage = !isUser && content.startsWith('Error:');
  
  return (
    <div className="w-full mb-3">
      <div className={`${isUser ? 'bg-blue-50' : 'bg-white'} ${isErrorMessage ? 'border-red-300 bg-red-50' : 'border-gray-300'} border rounded-lg p-3`}>
        <div className="flex items-start">
          <div className="flex-grow">
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
    </div>
  );
}
