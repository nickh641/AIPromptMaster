import OpenAI from "openai";

// Initialize OpenAI with the API key from environment variables
export function createOpenAIClient(apiKey: string) {
  return new OpenAI({ apiKey });
}

// Function to send a chat completion request
export async function getChatCompletion(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  temperature: number
) {
  try {
    const openai = createOpenAIClient(apiKey);
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}
