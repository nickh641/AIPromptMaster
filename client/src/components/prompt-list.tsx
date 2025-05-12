import { Prompt } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PromptListProps {
  prompts: Prompt[];
  isLoading: boolean;
  selectedPromptId: number | null;
  onSelectPrompt: (id: number) => void;
  onClearChat?: () => void;
  onStartChat?: () => void;
}

export function PromptList({ 
  prompts, 
  isLoading, 
  selectedPromptId, 
  onSelectPrompt,
  onClearChat,
  onStartChat
}: PromptListProps) {
  const selectedPrompt = prompts.find(p => p.id === selectedPromptId);

  return (
    <div className="w-full">
      <h2 className="text-lg font-medium text-gray-800 mb-2">Available Prompts</h2>
      
      {isLoading ? (
        <Skeleton className="h-10 w-full mb-4" />
      ) : (
        <Select 
          value={selectedPromptId?.toString()} 
          onValueChange={(value) => onSelectPrompt(parseInt(value))}
        >
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Dropdown list of prompts" />
          </SelectTrigger>
          <SelectContent>
            {prompts.length > 0 ? (
              prompts.map((prompt) => (
                <SelectItem key={prompt.id} value={prompt.id.toString()}>
                  {prompt.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>No prompts available</SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
      
      <div className="flex gap-2 mb-6">
        <Button 
          onClick={onStartChat}
          className="bg-pink-200 hover:bg-pink-300 text-black"
          disabled={!selectedPromptId || isLoading}
        >
          Start Chat
        </Button>
        <Button 
          onClick={onClearChat}
          className="bg-gray-100 hover:bg-gray-200 text-black"
          disabled={!selectedPromptId || isLoading}
        >
          Clear Chat
        </Button>
      </div>
    </div>
  );
}
