import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gameState = pgTable("game_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default("default"),
  currentXP: integer("current_xp").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
  todayXP: integer("today_xp").notNull().default(0),
  lastResetDate: text("last_reset_date").notNull().default(sql`CURRENT_DATE::text`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const actions = pgTable("actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default("default"),
  type: text("type").notNull(), // 'dm', 'loom', 'call', 'client', 'content', 'system'
  xpValue: integer("xp_value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  date: text("date").notNull().default(sql`CURRENT_DATE::text`),
});

export const todos = pgTable("todos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default("default"),
  title: text("title").notNull(),
  xpValue: integer("xp_value").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default("default"),
  type: text("type").notNull(), // 'dm_sprint', 'loom_marathon', etc.
  target: integer("target").notNull(),
  current: integer("current").notNull().default(0),
  timeLimit: integer("time_limit").notNull(), // in seconds
  timeRemaining: integer("time_remaining").notNull(),
  active: boolean("active").notNull().default(false),
  completed: boolean("completed").notNull().default(false),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default("default"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Insert schemas
export const insertGameStateSchema = createInsertSchema(gameState).omit({
  id: true,
  createdAt: true,
});

export const insertActionSchema = createInsertSchema(actions).omit({
  id: true,
  timestamp: true,
  date: true,
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  unlockedAt: true,
});

// Types
export type GameState = typeof gameState.$inferSelect;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;

export type Action = typeof actions.$inferSelect;
export type InsertAction = z.infer<typeof insertActionSchema>;

export type Todo = typeof todos.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

// Level requirements
export const LEVEL_REQUIREMENTS = {
  1: 0, 2: 100, 3: 250, 4: 450, 5: 700, 6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700,
  11: 3250, 12: 3850, 13: 4500, 14: 5200, 15: 5950, 16: 6750, 17: 7600, 18: 8500, 19: 9450, 20: 10500,
  21: 11600, 22: 12750, 23: 13950, 24: 15200, 25: 16500
};

// Action XP values
export const ACTION_XP_VALUES = {
  dm: 5,
  loom: 20,
  call: 30,
  client: 50,
  content: 15,
  system: 45,
};

// Action types
export const ACTION_TYPES = ['dm', 'loom', 'call', 'client', 'content', 'system'] as const;
export type ActionType = typeof ACTION_TYPES[number];
