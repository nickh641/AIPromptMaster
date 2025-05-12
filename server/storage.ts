import { users, prompts, messages, type User, type InsertUser, type Prompt, type InsertPrompt, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Prompt operations
  async getPrompt(id: number): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt;
  }

  async getPrompts(): Promise<Prompt[]> {
    return await db.select().from(prompts);
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db
      .insert(prompts)
      .values(insertPrompt)
      .returning();
    return prompt;
  }

  async updatePrompt(id: number, promptData: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const [updatedPrompt] = await db
      .update(prompts)
      .set(promptData)
      .where(eq(prompts.id, id))
      .returning();
    
    return updatedPrompt;
  }

  async deletePrompt(id: number): Promise<boolean> {
    const [deletedPrompt] = await db
      .delete(prompts)
      .where(eq(prompts.id, id))
      .returning();
    
    return !!deletedPrompt;
  }

  // Message operations
  async getMessagesByPromptId(promptId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.promptId, promptId))
      .orderBy(messages.id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Function to initialize the database with default data if needed
  async initializeDefaultData() {
    console.log("Initializing database with default data if needed...");
    
    // Check if we have an admin user
    const adminUser = await this.getUserByUsername("admin");
    
    if (!adminUser) {
      console.log("Creating default admin user...");
      await this.createUser({
        username: "admin",
        password: "admin123",
        isAdmin: true,
      });
    }
    
    // Check if we have a regular user
    const regularUser = await this.getUserByUsername("user");
    
    if (!regularUser) {
      console.log("Creating default regular user...");
      await this.createUser({
        username: "user",
        password: "user123",
        isAdmin: false,
      });
    }
    
    // Check if we have any prompts
    const existingPrompts = await this.getPrompts();
    
    if (existingPrompts.length === 0) {
      console.log("Creating sample prompt...");
      await this.createPrompt({
        name: "Customer Support Assistant",
        apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key",
        model: "gpt-4o",
        temperature: 0.7,
        content: "You are a helpful customer support assistant. Answer customer questions politely and professionally.",
        createdBy: 1,
      });
    }
    
    console.log("Database initialization complete.");
  }
}

// Create a new instance of DatabaseStorage
export const storage = new DatabaseStorage();
