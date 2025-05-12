interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export function ChatMessage({ content, isUser }: ChatMessageProps) {
  return (
    <div className={`mb-4 ${isUser ? 'ml-auto max-w-[80%]' : 'max-w-[80%]'}`}>
      <div className={`rounded-lg p-3 ${isUser ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
        <p className="whitespace-pre-wrap text-gray-800">{content}</p>
      </div>
    </div>
  );
}
