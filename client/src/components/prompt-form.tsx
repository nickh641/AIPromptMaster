import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Prompt } from "@shared/schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Form validation schema
const promptFormSchema = z.object({
  name: z.string().min(1, "Prompt name is required"),
  provider: z.string().min(1, "API provider is required"),
  apiKey: z.string().min(1, "API key is required"), // Still required but won't be stored in database
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2),
  content: z.string().min(1, "Prompt content is required"),
});

type PromptFormValues = z.infer<typeof promptFormSchema>;

interface PromptFormProps {
  promptData?: Prompt | null;
  onSuccess?: () => void;
}

export function PromptForm({ promptData, onSuccess }: PromptFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [temperatureDisplay, setTemperatureDisplay] = useState(
    promptData?.temperature.toString() || "0.7"
  );

  // Initialize form with default values or editing values
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      name: promptData?.name || "",
      provider: promptData?.provider || "openai", // Default to OpenAI
      apiKey: "", // API Key is not stored in DB so no default value
      model: promptData?.model || "gpt-4o",
      temperature: promptData?.temperature || 0.7,
      content: promptData?.content || "",
    },
  });

  // Create/update prompt mutation
  const saveMutation = useMutation({
    mutationFn: async (values: PromptFormValues) => {
      if (!user) throw new Error("You must be logged in to create a prompt");
      
      // Exclude API key from data sent to the server
      const { apiKey, ...promptDataToSave } = values;
      
      const promptPayload = {
        ...promptDataToSave,
        createdBy: user.id,
      };
      
      if (promptData) {
        // Update existing prompt
        const response = await apiRequest("PUT", `/api/prompts/${promptData.id}`, promptPayload);
        return response.json();
      } else {
        // Create new prompt
        const response = await apiRequest("POST", "/api/prompts", promptPayload);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error saving prompt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete prompt mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!promptData) throw new Error("No prompt to delete");
      const response = await apiRequest("DELETE", `/api/prompts/${promptData.id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({
        title: "Prompt deleted",
        description: "The prompt has been deleted successfully.",
      });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error deleting prompt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: PromptFormValues) => {
    saveMutation.mutate(values);
  };

  const handleTemperatureChange = (value: number[]) => {
    form.setValue("temperature", value[0]);
    setTemperatureDisplay(value[0].toString());
  };

  const handleTemperatureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 2) {
      form.setValue("temperature", value);
      setTemperatureDisplay(e.target.value);
    } else {
      setTemperatureDisplay(e.target.value);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Name:</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Provider:</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-1/2">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{form.getValues("provider")} API Key:</FormLabel>
              <FormControl>
                <Input {...field} type="password" className="w-1/2" placeholder="Enter your API key" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model:</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* OpenAI Models */}
                  <SelectItem value="gpt-4o">OpenAI - GPT-4o</SelectItem>
                  <SelectItem value="gpt-4">OpenAI - GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">OpenAI - GPT-3.5 Turbo</SelectItem>
                  
                  {/* Google Models */}
                  <SelectItem value="gemini-1.5-pro">Google - Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Google - Gemini 1.5 Flash</SelectItem>
                  
                  {/* Anthropic Models */}
                  <SelectItem value="claude-3-opus">Anthropic - Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Anthropic - Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temperature:</FormLabel>
              <div className="flex items-center space-x-4">
                <FormControl>
                  <Slider 
                    className="w-1/3" 
                    min={0} 
                    max={2} 
                    step={0.1} 
                    value={[field.value]} 
                    onValueChange={handleTemperatureChange}
                  />
                </FormControl>
                <Input 
                  type="text" 
                  value={temperatureDisplay} 
                  onChange={handleTemperatureInputChange}
                  onBlur={() => {
                    const value = parseFloat(temperatureDisplay);
                    if (!isNaN(value) && value >= 0 && value <= 2) {
                      form.setValue("temperature", value);
                    } else {
                      setTemperatureDisplay(field.value.toString());
                    }
                  }} 
                  className="w-16"
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt:</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={6} 
                  placeholder="You are a helpful assistant that..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex space-x-4 pt-4">
          <Button 
            type="submit" 
            className="btn-save"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <div className="h-5 w-5 border-2 border-t-transparent border-current rounded-full animate-spin mr-2"></div>
            ) : null}
            Save/Update
          </Button>
          
          {promptData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  className="btn-delete"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <div className="h-5 w-5 border-2 border-t-transparent border-current rounded-full animate-spin mr-2"></div>
                  ) : null}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the prompt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>
    </Form>
  );
}
