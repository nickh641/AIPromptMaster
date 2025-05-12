import { users, prompts, messages, type User, type InsertUser, type Prompt, type InsertPrompt, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Prompt operations
  getPrompt(id: number): Promise<Prompt | undefined>;
  getPrompts(): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: number, prompt: Partial<InsertPrompt>): Promise<Prompt | undefined>;
  deletePrompt(id: number): Promise<boolean>;
  
  // Message operations
  getMessagesByPromptId(promptId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private prompts: Map<number, Prompt>;
  private messages: Map<number, Message>;
  private userId: number;
  private promptId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.prompts = new Map();
    this.messages = new Map();
    this.userId = 1;
    this.promptId = 1;
    this.messageId = 1;
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true,
    });
    
    // Create default user
    this.createUser({
      username: "user",
      password: "user123",
      isAdmin: false,
    });
    
    // Create sample prompt
    this.createPrompt({
      name: "Customer Support Assistant",
      apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key",
      model: "gpt-4o",
      temperature: 0.7,
      content: "You are a helpful customer support assistant. Answer customer questions politely and professionally.",
      createdBy: 1,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Prompt operations
  async getPrompt(id: number): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }
  
  async getPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values());
  }
  
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.promptId++;
    const prompt: Prompt = { ...insertPrompt, id };
    this.prompts.set(id, prompt);
    return prompt;
  }
  
  async updatePrompt(id: number, promptData: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) return undefined;
    
    const updatedPrompt: Prompt = { ...prompt, ...promptData };
    this.prompts.set(id, updatedPrompt);
    return updatedPrompt;
  }
  
  async deletePrompt(id: number): Promise<boolean> {
    return this.prompts.delete(id);
  }
  
  // Message operations
  async getMessagesByPromptId(promptId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.promptId === promptId)
      .sort((a, b) => a.id - b.id);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const message: Message = { ...insertMessage, id };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
