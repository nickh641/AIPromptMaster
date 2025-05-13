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
      <h2 className="text-lg font-serif font-medium text-black mb-4">Available Prompts</h2>
      
      {isLoading ? (
        <Skeleton className="h-10 w-full mb-4" />
      ) : (
        <Select 
          value={selectedPromptId?.toString()} 
          onValueChange={(value) => onSelectPrompt(parseInt(value))}
        >
          <SelectTrigger className="w-full mb-4 border-2 border-gray-300 rounded-md bg-white">
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
      
      <div className="flex gap-4 mt-4">
        <Button 
          onClick={onStartChat}
          className="bg-pink-200 hover:bg-pink-300 text-black rounded-md border border-pink-300 px-6 font-medium"
          disabled={!selectedPromptId || isLoading}
        >
          Start Chat
        </Button>
        <Button 
          onClick={onClearChat}
          className="bg-white hover:bg-gray-100 text-black border border-gray-300 rounded-md px-6 font-medium"
          disabled={!selectedPromptId || isLoading}
        >
          Clear chat
        </Button>
      </div>
    </div>
  );
}
