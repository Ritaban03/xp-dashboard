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

// Level requirements - progressively challenging
export const LEVEL_REQUIREMENTS = {
  1: 0, 2: 200, 3: 500, 4: 900, 5: 1400, 6: 2000, 7: 2700, 8: 3500, 9: 4400, 10: 5400,
  11: 6500, 12: 7700, 13: 9000, 14: 10400, 15: 11900, 16: 13500, 17: 15200, 18: 17000, 19: 18900, 20: 21000,
  21: 23200, 22: 25500, 23: 27900, 24: 30400, 25: 33000, 26: 35700, 27: 38500, 28: 41400, 29: 44400, 30: 47500,
  31: 50700, 32: 54000, 33: 57400, 34: 60900, 35: 64500, 36: 68200, 37: 72000, 38: 75900, 39: 79900, 40: 84000,
  41: 88200, 42: 92500, 43: 96900, 44: 101400, 45: 106000, 46: 110700, 47: 115500, 48: 120400, 49: 125400, 50: 130500
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

// Challenge types
export const CHALLENGE_TYPES = {
  dm_sprint: { label: "DM Sprint", description: "Send as many DMs as possible", actionType: 'dm' as ActionType },
  loom_marathon: { label: "Loom Marathon", description: "Create multiple Loom videos", actionType: 'loom' as ActionType },
  call_blitz: { label: "Call Booking Blitz", description: "Book multiple calls", actionType: 'call' as ActionType },
  content_storm: { label: "Content Creation Storm", description: "Write multiple pieces of content", actionType: 'content' as ActionType },
  system_builder: { label: "System Builder Challenge", description: "Create multiple systems", actionType: 'system' as ActionType },
  sales_domination: { label: "Sales Domination", description: "Close multiple clients", actionType: 'client' as ActionType },
  productivity_beast: { label: "Productivity Beast", description: "Complete mixed actions", actionType: 'dm' as ActionType }
} as const;

// Leagues and titles based on level
export const LEAGUES = {
  rookie: { minLevel: 1, maxLevel: 5, title: "Rookie Hustler", color: "text-gray-400", badge: "🥉" },
  bronze: { minLevel: 6, maxLevel: 10, title: "Bronze Grinder", color: "text-orange-600", badge: "🥉" },
  silver: { minLevel: 11, maxLevel: 15, title: "Silver Performer", color: "text-gray-300", badge: "🥈" },
  gold: { minLevel: 16, maxLevel: 25, title: "Gold Achiever", color: "text-yellow-500", badge: "🥇" },
  platinum: { minLevel: 26, maxLevel: 35, title: "Platinum Elite", color: "text-blue-400", badge: "💎" },
  diamond: { minLevel: 36, maxLevel: 45, title: "Diamond Legend", color: "text-cyan-400", badge: "💎" },
  master: { minLevel: 46, maxLevel: 50, title: "Master Champion", color: "text-purple-500", badge: "👑" }
};

export function getLeague(level: number) {
  for (const [key, league] of Object.entries(LEAGUES)) {
    if (level >= league.minLevel && level <= league.maxLevel) {
      return { key, ...league };
    }
  }
  return { key: 'rookie', ...LEAGUES.rookie };
}
