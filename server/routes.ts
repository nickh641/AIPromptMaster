import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromptSchema, insertMessageSchema } from "@shared/schema";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // In a real application, you would use JWT or sessions
    res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });
  });
  
  // Prompt routes
  app.get("/api/prompts", async (_req, res) => {
    const prompts = await storage.getPrompts();
    res.json(prompts);
  });
  
  app.get("/api/prompts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prompt ID" });
    }
    
    const prompt = await storage.getPrompt(id);
    
    if (!prompt) {
      return res.status(404).json({ message: "Prompt not found" });
    }
    res.json(prompt);
  });
  
  app.post("/api/prompts", async (req, res) => {
    try {
      const promptData = insertPromptSchema.parse(req.body);
      const prompt = await storage.createPrompt(promptData);
      res.status(201).json(prompt);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.put("/api/prompts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prompt ID" });
    }
    
    try {
      const promptData = insertPromptSchema.partial().parse(req.body);
      const updatedPrompt = await storage.updatePrompt(id, promptData);
      
      if (!updatedPrompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json(updatedPrompt);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.delete("/api/prompts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prompt ID" });
    }
    
    const success = await storage.deletePrompt(id);
    
    if (!success) {
      return res.status(404).json({ message: "Prompt not found" });
    }
    
    res.status(204).end();
  });
  
  // Message routes
  app.get("/api/prompts/:promptId/messages", async (req, res) => {
    const promptId = parseInt(req.params.promptId);
    
    if (isNaN(promptId)) {
      return res.status(400).json({ message: "Invalid prompt ID" });
    }
    
    const messages = await storage.getMessagesByPromptId(promptId);
    res.json(messages);
  });
  
  app.post("/api/prompts/:promptId/messages", async (req, res) => {
    const promptId = parseInt(req.params.promptId);
    
    if (isNaN(promptId)) {
      return res.status(400).json({ message: "Invalid prompt ID" });
    }
    
    const prompt = await storage.getPrompt(promptId);
    
    if (!prompt) {
      return res.status(404).json({ message: "Prompt not found" });
    }
    
    try {
      // Save the user message
      const userMessage = insertMessageSchema.parse({
        promptId,
        content: req.body.content,
        isUser: true,
        timestamp: new Date().toISOString()
      });
      
      await storage.createMessage(userMessage);
      
      // Get AI response
      let aiResponse: string;
      
      try {
        // Use environment variable for API key based on provider
        let apiKey: string;
        
        switch (prompt.provider) {
          case 'openai':
            apiKey = process.env.OPENAI_API_KEY || '';
            break;
          case 'google':
            apiKey = process.env.GOOGLE_API_KEY || '';
            break;
          case 'anthropic':
            apiKey = process.env.ANTHROPIC_API_KEY || '';
            break;
          default:
            apiKey = process.env.OPENAI_API_KEY || '';
        }
        
        if (!apiKey) {
          throw new Error(`API key not found for provider: ${prompt.provider}`);
        }
        
        // Different AI provider implementations
        if (prompt.provider === 'openai') {
          const openai = new OpenAI({ apiKey });
          
          try {
            // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            const completion = await openai.chat.completions.create({
              model: prompt.model,
              messages: [
                { role: "system", content: prompt.content },
                { role: "user", content: req.body.content }
              ],
              temperature: prompt.temperature,
            });
            
            aiResponse = completion.choices[0].message.content || "Sorry, I couldn't generate a response.";
          } catch (error: any) {
            console.error("OpenAI API error:", error);
            
            // More detailed error handling for OpenAI errors
            if (error.code === 'invalid_api_key') {
              aiResponse = "Error: Invalid API key. Please ask the administrator to update the OpenAI API key.";
            } else if (error.code === 'rate_limit_exceeded') {
              aiResponse = "Error: Rate limit exceeded. Please try again in a few moments.";
            } else {
              aiResponse = `Error communicating with OpenAI: ${error.message || "Unknown error"}`;
            }
          }
        } else if (prompt.provider === 'google') {
          // Placeholder for Google AI implementation
          aiResponse = "Support for Google AI is coming soon. Please use OpenAI provider for now.";
        } else if (prompt.provider === 'anthropic') {
          // Placeholder for Anthropic AI implementation
          aiResponse = "Support for Anthropic AI is coming soon. Please use OpenAI provider for now.";
        } else {
          aiResponse = `Unknown provider: ${prompt.provider}`;
        }
      } catch (error: any) {
        console.error("AI API error:", error);
        aiResponse = `Error: ${error.message || "There was an error communicating with the AI service."}`;
      }
      
      // Save AI response
      const aiMessage = await storage.createMessage({
        promptId,
        content: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      });
      
      // Return both messages
      res.status(201).json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
