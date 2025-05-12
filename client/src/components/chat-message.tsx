interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export function ChatMessage({ content, isUser }: ChatMessageProps) {
  // For simplicity in the mockup style, we'll just show all messages the same way
  return (
    <div className="w-full mb-3">
      <div className="bg-white border border-gray-300 rounded-lg p-3">
        <p className="whitespace-pre-wrap text-gray-800">{content}</p>
      </div>
    </div>
  );
}
