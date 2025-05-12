import { Prompt } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface PromptListProps {
  prompts: Prompt[];
  isLoading: boolean;
  selectedPromptId: number | null;
  onSelectPrompt: (id: number) => void;
}

export function PromptList({ prompts, isLoading, selectedPromptId, onSelectPrompt }: PromptListProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Available Prompts</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-1">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-9 w-full rounded-md" />
            ))}
          </div>
        ) : prompts.length > 0 ? (
          <ul className="space-y-1">
            {prompts.map((prompt) => (
              <li key={prompt.id}>
                <button 
                  onClick={() => onSelectPrompt(prompt.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    selectedPromptId === prompt.id 
                      ? "text-gray-900 bg-gray-100" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {prompt.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No prompts available
          </div>
        )}
      </div>
    </div>
  );
}
