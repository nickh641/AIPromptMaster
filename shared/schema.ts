import { pgTable, text, serial, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  apiKey: text("api_key").notNull(),
  model: text("model").notNull(),
  temperature: real("temperature").notNull(),
  content: text("content").notNull(),
  createdBy: integer("created_by").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").notNull(),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  name: true,
  apiKey: true,
  model: true,
  temperature: true,
  content: true,
  createdBy: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  promptId: true,
  content: true,
  isUser: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type User = typeof users.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type Message = typeof messages.$inferSelect;
